// app/api/cron/cleanup-notifications/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

    const result = await prisma.notification.deleteMany({
      where: { createdAt: { lt: threeDaysAgo } },
    });

    console.log(`[cron] Cleaned up ${result.count} stale notifications`);

    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error('Cleanup notifications error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
