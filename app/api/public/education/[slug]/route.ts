// app/api/public/education/[slug]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

const getCachedEducationDetail = unstable_cache(
  async (slug: string) => {
    return prisma.education.findFirst({
      where: { slug, isPublished: true },
      include: { author: { select: { name: true } } },
    });
  },
  ['public-education-detail'],
  { revalidate: 60, tags: ['education'] },
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-content');
    if (limited) return limited;

    const { slug } = await params;

    const post = await getCachedEducationDetail(slug);

    if (!post) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Get public education detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
