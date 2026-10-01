// app/api/lp3h/stats/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole('lp3h');

    const lp3h = await prisma.lp3hProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!lp3h) {
      return NextResponse.json({ error: 'Profil LP3H tidak ditemukan' }, { status: 404 });
    }

    const totalPendamping = await prisma.pendamping.count({ where: { lp3hId: lp3h.id } });

    // 4 count status digabung jadi 1 query groupBy, dulu 4 query
    // count() terpisah
    const statusAgg = await prisma.daftarMandiriSubmission.groupBy({
      by: ['status'],
      where: { lp3hId: lp3h.id },
      _count: { _all: true },
    });

    const countByStatus = (status: string) => statusAgg.find((row) => row.status === status)?._count._all ?? 0;

    const belumDiproses = countByStatus('belum_diproses');
    const sedangDiproses = countByStatus('sedang_diproses');
    const selesai = countByStatus('selesai');
    const ditolak = countByStatus('ditolak');

    const pendampingList = await prisma.pendamping.findMany({
      where: { lp3hId: lp3h.id },
      select: {
        id: true,
        name: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { submissions: { _count: 'desc' } },
    });

    const pendampingStats = pendampingList.map((p) => ({
      pendampingId: p.id,
      pendampingName: p.name,
      totalDipilih: p._count.submissions,
    }));

    const recentSubmissions = await prisma.daftarMandiriSubmission.findMany({
      where: { lp3hId: lp3h.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        status: true,
        createdAt: true,
        product: { select: { name: true, umkm: { select: { businessName: true } } } },
        pendamping: { select: { name: true } },
      },
    });

    return NextResponse.json({
      data: {
        totalPendamping,
        belumDiproses,
        sedangDiproses,
        selesai,
        ditolak,
        pendampingStats,
        recentSubmissions,
      },
    });
  } catch (error) {
    console.error('Get lp3h stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
