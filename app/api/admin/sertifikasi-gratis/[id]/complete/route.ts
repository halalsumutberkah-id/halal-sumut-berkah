// app/api/admin/sertifikasi-gratis/[id]/complete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { completeSertifikasiGratisSchema } from '@/schemas/sertifikasi-gratis.schema';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.sertifikasiGratisSubmission.findUnique({
      where: { id },
      include: {
        umkm: { select: { userId: true } },
        products: { select: { productId: true } },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    if (existing.status !== 'ditugaskan') {
      return NextResponse.json({ error: 'Pengajuan ini belum ditugaskan, tidak bisa ditandai selesai' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = completeSertifikasiGratisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const productIds = existing.products.map((p) => p.productId);

    // update submission + SEMUA produk dalam 1 pengajuan ini sekaligus,
    // dalam 1 transaksi (semua berhasil atau semua batal)
    const [updatedSubmission] = await prisma.$transaction([
      prisma.sertifikasiGratisSubmission.update({
        where: { id },
        data: {
          status: 'selesai',
          halalCertNumber: parsed.data.halalCertNumber,
          halalCertUrl: parsed.data.halalCertUrl,
        },
      }),
      prisma.product.updateMany({
        where: { id: { in: productIds } },
        data: {
          halalStatus: 'halal',
          halalCertNumber: parsed.data.halalCertNumber,
          halalCertUrl: parsed.data.halalCertUrl,
        },
      }),
    ]);

    await prisma.notification.create({
      data: {
        userId: existing.umkm.userId,
        type: 'sertifikasi_gratis_selesai',
        title: 'Self Declare Selesai',
        message: `Selamat! ${productIds.length} produk anda telah resmi bersertifikat halal.`,
        link: '/umkm/sertifikasi-gratis',
      },
    });

    return NextResponse.json({
      message: 'Pengajuan berhasil diselesaikan, semua produk sudah bersertifikat halal',
      data: updatedSubmission,
    });
  } catch (error) {
    console.error('Complete sertifikasi-gratis error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
