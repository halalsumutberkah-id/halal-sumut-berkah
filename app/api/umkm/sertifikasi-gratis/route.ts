// app/api/umkm/sertifikasi-gratis/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { createSertifikasiGratisSchema } from '@/schemas/sertifikasi-gratis.schema';
import { getAdminIds } from '@/lib/get-admin-ids';
import { findAvailableFasilitasiCodeId } from '@/lib/fasilitasi-code';
import { sendPendampinganEmail } from '@/lib/sertifikasi-gratis-email';

export const dynamic = 'force-dynamic';

const ACTIVE_DAFTAR_MANDIRI = ['belum_diproses', 'sedang_diproses'];
const ACTIVE_SERTIFIKASI_GRATIS = ['menunggu_verifikasi', 'ditugaskan'];

export async function GET() {
  try {
    const user = await requireRole('umkm');

    const umkm = await prisma.umkmProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const submissions = await prisma.sertifikasiGratisSubmission.findMany({
      where: { umkmId: umkm.id },
      orderBy: { createdAt: 'desc' },
      include: {
        products: { include: { product: { select: { id: true, name: true, photoUrl: true } } } },
        lp3h: { select: { name: true, phone: true } },
        pendamping: { select: { name: true, phone: true } },
      },
    });

    return NextResponse.json({ data: submissions });
  } catch (error) {
    console.error('Get umkm sertifikasi-gratis list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('umkm');

    const umkm = await prisma.umkmProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, businessName: true },
    });
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createSertifikasiGratisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { productIds, pendampingId } = parsed.data;

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, umkmId: umkm.id },
      include: {
        daftarMandiriSubmissions: { select: { status: true } },
        sertifikasiGratisProducts: {
          include: { submission: { select: { status: true } } },
        },
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ error: 'Ada produk yang tidak valid' }, { status: 400 });
    }

    for (const product of products) {
      if (product.halalStatus === 'halal') {
        return NextResponse.json({ error: `Produk "${product.name}" sudah bersertifikat halal` }, { status: 400 });
      }

      const hasActiveDaftarMandiri = product.daftarMandiriSubmissions.some((s) => ACTIVE_DAFTAR_MANDIRI.includes(s.status));
      const hasActiveSertifikasiGratis = product.sertifikasiGratisProducts.some((sp) => ACTIVE_SERTIFIKASI_GRATIS.includes(sp.submission.status));

      if (hasActiveDaftarMandiri || hasActiveSertifikasiGratis) {
        return NextResponse.json({ error: `Produk "${product.name}" masih ada pengajuan aktif` }, { status: 400 });
      }
    }

    // Pendamping opsional - UMKM pilih LANGSUNG (bukan LP3H dulu). Kalau
    // dipilih, pastiin valid & sudah terverifikasi, lalu derive
    // lp3hId dari relasinya biar kolom lp3hId di submission tetap
    // konsisten kebawa buat tampilan Admin/LP3H
    let lp3hId: string | null = null;
    let selectedPendampingLp3h: { name: string; user: { email: string } } | null = null;
    if (pendampingId) {
      const pendamping = await prisma.pendamping.findUnique({
        where: { id: pendampingId },
        select: { id: true, lp3hId: true, verificationStatus: true, lp3h: { select: { name: true, user: { select: { email: true } } } } },
      });
      if (!pendamping || pendamping.verificationStatus !== 'terverifikasi') {
        return NextResponse.json({ error: 'Pendamping yang dipilih tidak valid' }, { status: 400 });
      }
      lp3hId = pendamping.lp3hId;
      selectedPendampingLp3h = pendamping.lp3h;
    }

    // Kode Fasilitasi - assign OTOMATIS dari kode aktif yang kuotanya
    // masih tersisa, urut paling lama dibuat. Kalau semua penuh/tidak
    // ada kode aktif, tetap lanjut tanpa kode (boleh, sesuai ketentuan)
    const fasilitasiCodeId = await findAvailableFasilitasiCodeId();

    const submission = await prisma.sertifikasiGratisSubmission.create({
      data: {
        umkmId: umkm.id,
        lp3hId,
        pendampingId: pendampingId || null,
        fasilitasiCodeId,
        products: { create: productIds.map((productId) => ({ productId })) },
      },
      include: { products: { include: { product: { select: { name: true } } } } },
    });

    const adminIds = await getAdminIds();
    if (adminIds.length > 0) {
      await prisma.notification.createMany({
        data: adminIds.map((adminId) => ({
          userId: adminId,
          type: 'sertifikasi_gratis_submitted',
          title: 'Pengajuan Self Declare Baru',
          message: `${umkm.businessName} mengajukan ${productIds.length} produk untuk Self Declare.`,
          link: '/admin/sertifikasi-gratis',
        })),
      });
    }

    // B1d - notifikasi EMAIL ke LP3H kalau UMKM langsung pilih Pendamping
    // sendiri pas submit (bukan dibiarkan kosong buat ditentukan Admin).
    // Gagal kirim email TIDAK BOLEH menggagalkan submission-nya sendiri.
    if (selectedPendampingLp3h) {
      try {
        await sendPendampinganEmail(
          selectedPendampingLp3h.user.email,
          selectedPendampingLp3h.name,
          umkm.businessName,
          submission.products.map((p) => p.product.name),
        );
      } catch (emailError) {
        console.error('Send pendampingan email error:', emailError);
      }
    }

    return NextResponse.json({ message: 'Pengajuan berhasil dikirim', data: submission }, { status: 201 });
  } catch (error) {
    console.error('Create sertifikasi-gratis error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
