// app/api/admin/stats/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    // sequential (bukan Promise.all) - tetap ikutin batasan Neon serverless
    // driver. tapi 4 count produk (total/published/pending/rejected)
    // digabung jadi 1 query groupBy, jadi dari 10 query total jadi 7
    const totalUmkm = await prisma.umkmProfile.count();
    const totalLp3h = await prisma.lp3hProfile.count();
    const totalLph = await prisma.lph.count();

    const productAgg = await prisma.product.groupBy({
      by: ['verificationStatus', 'isPublished'],
      _count: { _all: true },
    });

    const totalEducation = await prisma.education.count({ where: { isPublished: true } });
    const totalNews = await prisma.news.count({ where: { isPublished: true } });
    const pendingSertifikasiGratis = await prisma.sertifikasiGratisSubmission.count({
      where: { status: 'menunggu_verifikasi' },
    });

    const totalProducts = productAgg.reduce((sum, row) => sum + row._count._all, 0);
    const publishedProducts = productAgg.filter((row) => row.isPublished).reduce((sum, row) => sum + row._count._all, 0);
    const pendingVerification = productAgg.filter((row) => row.verificationStatus === 'pending').reduce((sum, row) => sum + row._count._all, 0);
    const rejectedProducts = productAgg.filter((row) => row.verificationStatus === 'ditolak').reduce((sum, row) => sum + row._count._all, 0);

    return NextResponse.json({
      data: {
        totalUmkm,
        totalLp3h,
        totalLph,
        totalProducts,
        publishedProducts,
        pendingVerification,
        rejectedProducts,
        totalEducation,
        totalNews,
        pendingSertifikasiGratis,
      },
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
