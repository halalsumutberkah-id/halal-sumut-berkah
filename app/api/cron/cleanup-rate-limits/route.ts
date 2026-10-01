import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await prisma.rateLimit.deleteMany({
      where: { windowStart: { lt: cutoff } },
    });

    console.log(`[cron] Cleaned up ${result.count} stale rate_limits rows`);

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('Cleanup rate limits error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
