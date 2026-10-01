// app/api/umkm/daftar-mandiri/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { daftarMandiriSchema } from '@/schemas/daftar-mandiri.schema';
import { enforceRateLimit } from '@/lib/rate-limit';
import { sendPendampingNotificationEmail } from '@/lib/pendamping-notification-email';

export const dynamic = 'force-dynamic';

async function getOwnUmkmProfile(userId: string) {
  return prisma.umkmProfile.findUnique({
    where: { userId },
    select: { id: true, businessName: true, businessContactNumber: true },
  });
}

export async function GET() {
  try {
    const user = await requireRole('umkm');

    const umkm = await getOwnUmkmProfile(user.id);
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const submissions = await prisma.daftarMandiriSubmission.findMany({
      where: { product: { umkmId: umkm.id } },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, photoUrl: true } },
        lp3h: { select: { name: true } },
        pendamping: { select: { name: true } },
      },
    });

    return NextResponse.json({ data: submissions });
  } catch (error) {
    console.error('Get umkm daftar-mandiri list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('umkm');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const umkm = await getOwnUmkmProfile(user.id);
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = daftarMandiriSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = parsed.data;

    // produk harus benar-benar milik UMKM yang login
    const product = await prisma.product.findUnique({ where: { id: data.productId } });
    if (!product || product.umkmId !== umkm.id) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    // produk yang statusnya sudah "halal" (resmi bersertifikat) tidak
    // perlu/tidak boleh diajukan Daftar Mandiri lagi
    if (product.halalStatus === 'halal') {
      return NextResponse.json({ error: 'Produk ini sudah bersertifikat halal, tidak perlu mengajukan Daftar Mandiri lagi' }, { status: 400 });
    }

    const lp3h = await prisma.lp3hProfile.findUnique({ where: { id: data.lp3hId } });
    if (!lp3h) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    // pendamping harus benar-benar milik LP3H yang dipilih - cegah kombinasi
    // yang tidak nyambung (misal pendamping A dipilih tapi LP3H-nya B)
    const pendamping = await prisma.pendamping.findUnique({ where: { id: data.pendampingId } });
    if (!pendamping || pendamping.lp3hId !== data.lp3hId) {
      return NextResponse.json({ error: 'Pendamping tidak valid untuk LP3H yang dipilih' }, { status: 400 });
    }

    // cegah pengajuan dobel buat produk yang sama selagi masih ada
    // pengajuan AKTIF (belum selesai/ditolak) - biar tidak ada 2 LP3H beda
    // kerjain produk yang sama tanpa saling tahu
    const activeSubmission = await prisma.daftarMandiriSubmission.findFirst({
      where: {
        productId: data.productId,
        status: { in: ['belum_diproses', 'sedang_diproses'] },
      },
    });

    if (activeSubmission) {
      return NextResponse.json(
        {
          error: 'Produk ini masih memiliki pengajuan Sertifikasi Halal Gratis yang aktif. Tunggu sampai pengajuan sebelumnya selesai atau ditolak sebelum mengajukan ulang.',
        },
        { status: 400 },
      );
    }

    const submission = await prisma.daftarMandiriSubmission.create({
      data: {
        productId: data.productId,
        lp3hId: data.lp3hId,
        pendampingId: data.pendampingId,
        isLowRisk: data.isLowRisk,
        usesHalalIngredients: data.usesHalalIngredients,
        simpleCleanProduction: data.simpleCleanProduction,
        simpleEquipment: data.simpleEquipment,
        simplePreservation: data.simplePreservation,
        agreedToTerms: data.agreedToTerms,
      },
    });

    // produk otomatis pindah status "proses" (sedang diurus sertifikasinya)
    await prisma.product.update({
      where: { id: data.productId },
      data: { halalStatus: 'proses' },
    });

    // notifikasi ke LP3H yang dipilih
    await prisma.notification.create({
      data: {
        userId: lp3h.userId,
        type: 'daftar_mandiri_submitted',
        title: 'Pengajuan Daftar Mandiri Baru',
        message: `${product.name} mengajukan pendampingan sertifikasi halal Daftar Mandiri.`,
        link: '/lp3h/dashboard',
      },
    });

    // email ke Pendamping yang dipilih - Pendamping tidak punya akun/login,
    // jadi email satu-satunya cara notifikasi ke mereka. kalau Pendamping
    // belum sempat isi emailP3h, lewati saja (tidak wajib, dan jangan
    // sampai gagal kirim email bikin submit gagal total)
    if (pendamping.emailP3h) {
      try {
        await sendPendampingNotificationEmail(pendamping.emailP3h, pendamping.name, product.name, umkm.businessName, umkm.businessContactNumber ?? '-');
      } catch (emailError) {
        console.error('Send pendamping notification email error:', emailError);
      }
    }

    return NextResponse.json({ message: 'Pengajuan berhasil dikirim', data: submission }, { status: 201 });
  } catch (error) {
    console.error('Create daftar-mandiri submission error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
