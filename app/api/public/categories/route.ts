import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

const getCachedCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
  },
  ['public-categories-list'],
  { revalidate: 60, tags: ['categories'] },
);

export async function GET(req: NextRequest) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-categories');
    if (limited) return limited;

    const categories = await getCachedCategories();

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Get public categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
