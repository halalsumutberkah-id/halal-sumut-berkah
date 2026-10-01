// app/api/public/education/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const getCachedEducationList = unstable_cache(
  async (category: string | null) => {
    return prisma.education.findMany({
      where: {
        isPublished: true,
        ...(category ? { category } : {}),
      },
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        thumbnail: true,
        content: true,
        publishedAt: true,
      },
    });
  },
  ['public-education-list'],
  { revalidate: 60, tags: ['education'] },
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const posts = await getCachedEducationList(category);

    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error('Get public education list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
