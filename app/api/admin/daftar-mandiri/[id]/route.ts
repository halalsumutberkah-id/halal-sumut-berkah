// app/api/admin/daftar-mandiri/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateDaftarMandiriStatusSchema } from '@/schemas/daftar-mandiri.schema';
import { sendDaftarMandiriStatusEmail } from '@/lib/daftar-mandiri-status-email';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const submission = await prisma.daftarMandiriSubmission.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            umkm: {
              select: {
                businessName: true,
                ownerName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
        lp3h: { select: { name: true, phone: true } },
        pendamping: { select: { name: true, phone: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error('Get admin daftar-mandiri detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const body = await req.json();
    const parsed = updateDaftarMandiriStatusSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const existing = await prisma.daftarMandiriSubmission.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            name: true,
            umkm: {
              select: { userId: true, ownerName: true, user: { select: { email: true } } },
            },
          },
        },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    const statusChanged = existing.status !== parsed.data.status;

    const updated = await prisma.daftarMandiriSubmission.update({
      where: { id },
      data: {
        status: parsed.data.status,
        adminNote: parsed.data.adminNote || null,
      },
    });

    // notifikasi ke UMKM cuma kalau status BENERAN berubah - biar Admin
    // bebas edit catatan internal tanpa spam notifikasi tiap kali simpan
    if (statusChanged) {
      await prisma.notification.create({
        data: {
          userId: existing.product.umkm.userId,
          type: 'daftar_mandiri_status_updated',
          title: 'Status Pengajuan Daftar Mandiri Diperbarui',
          message: `Status pengajuan untuk ${existing.product.name} kini: ${parsed.data.status.replace(/_/g, ' ')}.`,
          link: '/umkm/daftar-mandiri',
        },
      });

      try {
        await sendDaftarMandiriStatusEmail(existing.product.umkm.user.email, existing.product.umkm.ownerName, existing.product.name, parsed.data.status, parsed.data.adminNote);
      } catch (emailError) {
        console.error('Send daftar-mandiri status email error:', emailError);
      }
    }

    // opsional: Admin bisa langsung inputkan nomor & file sertifikat halal
    // di sini kalau UMKM belum sempat isi sendiri di E-Catalog - kalau
    // keduanya diisi, produk otomatis naik status jadi "halal"
    if (parsed.data.halalCertNumber && parsed.data.halalCertUrl) {
      await prisma.product.update({
        where: { id: existing.productId },
        data: {
          halalCertNumber: parsed.data.halalCertNumber,
          halalCertUrl: parsed.data.halalCertUrl,
          halalStatus: 'halal',
        },
      });
    } else if (statusChanged && parsed.data.status === 'ditolak') {
      // pengajuan ditolak - produk balik ke "belum_halal" biar UMKM tahu
      // perlu ajukan ulang (mungkin lewat LP3H/Pendamping lain)
      await prisma.product.update({
        where: { id: existing.productId },
        data: { halalStatus: 'belum_halal' },
      });
    }

    return NextResponse.json({ data: updated, message: 'Status berhasil diperbarui' });
  } catch (error) {
    console.error('Update admin daftar-mandiri status error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.daftarMandiriSubmission.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    // DaftarMandiriSubmission itu sendiri tidak punya relasi lain yang
    // bergantung padanya (dia "daun" di pohon relasi), jadi aman dihapus
    // langsung tanpa perlu cek riwayat lebih lanjut
    await prisma.daftarMandiriSubmission.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengajuan berhasil dihapus' });
  } catch (error) {
    console.error('Delete admin daftar-mandiri error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
