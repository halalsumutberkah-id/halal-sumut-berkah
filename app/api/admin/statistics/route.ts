// app/api/admin/statistics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { statisticSchema } from '@/schemas/statistic.schema';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const statistics = await prisma.halalStatistic.findMany({
      orderBy: [{ period: 'desc' }, { kabupaten: 'asc' }],
    });

    return NextResponse.json({ data: statistics });
  } catch (error) {
    console.error('Get statistics error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('super_admin');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const parsed = statisticSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { period, kabupaten, certifiedCount } = parsed.data;

    const statistic = await prisma.halalStatistic.upsert({
      where: { period_kabupaten: { period, kabupaten } },
      update: { certifiedCount },
      create: { period, kabupaten, certifiedCount },
    });

    revalidatePath('/tentang-kami');
    revalidateTag('statistics', { expire: 0 });

    return NextResponse.json({ message: 'Data statistik berhasil disimpan', data: statistic }, { status: 201 });
  } catch (error) {
    console.error('Create statistic error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
