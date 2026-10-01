// app/api/umkm/stats/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole('umkm');

    const umkm = await prisma.umkmProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, businessName: true },
    });

    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    // 4 count produk digabung jadi 1 groupBy
    const productAgg = await prisma.product.groupBy({
      by: ['verificationStatus', 'isPublished'],
      where: { umkmId: umkm.id },
      _count: { _all: true },
    });

    const totalProducts = productAgg.reduce((sum, row) => sum + row._count._all, 0);
    const publishedProducts = productAgg.filter((row) => row.isPublished).reduce((sum, row) => sum + row._count._all, 0);
    const pendingVerification = productAgg.filter((row) => row.verificationStatus === 'pending').reduce((sum, row) => sum + row._count._all, 0);
    const rejectedProducts = productAgg.filter((row) => row.verificationStatus === 'ditolak').reduce((sum, row) => sum + row._count._all, 0);

    // 3 count daftar-mandiri digabung jadi 1 groupBy
    const daftarMandiriAgg = await prisma.daftarMandiriSubmission.groupBy({
      by: ['status'],
      where: { product: { umkmId: umkm.id } },
      _count: { _all: true },
    });

    const daftarMandiriTotal = daftarMandiriAgg.reduce((sum, row) => sum + row._count._all, 0);
    const daftarMandiriActive = daftarMandiriAgg.filter((row) => ['belum_diproses', 'sedang_diproses'].includes(row.status)).reduce((sum, row) => sum + row._count._all, 0);
    const daftarMandiriCompleted = daftarMandiriAgg.filter((row) => row.status === 'selesai').reduce((sum, row) => sum + row._count._all, 0);

    return NextResponse.json({
      data: {
        businessName: umkm.businessName,
        totalProducts,
        publishedProducts,
        pendingVerification,
        rejectedProducts,
        daftarMandiriTotal,
        daftarMandiriActive,
        daftarMandiriCompleted,
      },
    });
  } catch (error) {
    console.error('Get umkm stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
