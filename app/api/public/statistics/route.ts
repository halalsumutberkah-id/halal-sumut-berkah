// app/api/public/statistics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';
import { TOTAL_PROVINSI } from '@/lib/statistics';

export const dynamic = 'force-dynamic';

const getStatisticsData = unstable_cache(
  async () => {
    const allStatistics = await prisma.halalStatistic.findMany({
      orderBy: { period: 'asc' },
    });

    // 1. Line chart: tren total se-provinsi
    let totalTrend = allStatistics.filter((s) => s.kabupaten === TOTAL_PROVINSI).map((s) => ({ period: s.period, certifiedCount: s.certifiedCount }));

    // Fallback: Jika admin belum input entri TOTAL_PROVINSI khusus,
    // hitung agregasi otomatis dari akumulasi per kabupaten per periode
    if (totalTrend.length === 0 && allStatistics.length > 0) {
      const periodSumMap = new Map<string, number>();

      for (const stat of allStatistics) {
        const currentSum = periodSumMap.get(stat.period) || 0;
        periodSumMap.set(stat.period, currentSum + stat.certifiedCount);
      }

      totalTrend = Array.from(periodSumMap.entries())
        .map(([period, certifiedCount]) => ({ period, certifiedCount }))
        .sort((a, b) => a.period.localeCompare(b.period));
    }

    // 2. Bar chart: data wilayah terkini per kabupaten
    const latestPerKabupaten = new Map<string, { kabupaten: string; period: string; certifiedCount: number }>();

    for (const stat of allStatistics) {
      if (stat.kabupaten === TOTAL_PROVINSI) continue;

      const existing = latestPerKabupaten.get(stat.kabupaten);
      if (!existing || stat.period >= existing.period) {
        latestPerKabupaten.set(stat.kabupaten, {
          kabupaten: stat.kabupaten,
          period: stat.period,
          certifiedCount: stat.certifiedCount,
        });
      }
    }

    const perKabupaten = Array.from(latestPerKabupaten.values()).sort((a, b) => b.certifiedCount - a.certifiedCount);

    return { totalTrend, perKabupaten };
  },
  ['public-statistics'],
  { revalidate: 60, tags: ['statistics'] },
);

export async function GET(req: NextRequest) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-content');
    if (limited) return limited;

    const data = await getStatisticsData();

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get public statistics error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
