// app/api/public/business-categories/route.ts

import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const getCachedBusinessCategories = unstable_cache(
  async () => {
    return prisma.businessCategory.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  },
  ['public-business-categories'],
  { revalidate: 60, tags: ['business-categories'] },
);

export async function GET() {
  try {
    const categories = await getCachedBusinessCategories();

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Get business categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
