import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-content');
    if (limited) return limited;

    const lp3hList = await prisma.lp3hProfile.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ data: lp3hList });
  } catch (error) {
    console.error('Get public lp3h list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
