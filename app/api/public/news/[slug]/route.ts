import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

const getCachedNewsDetail = unstable_cache(
  async (slug: string) => {
    return prisma.news.findFirst({
      where: { slug, isPublished: true },
      include: { author: { select: { name: true } } },
    });
  },
  ['public-news-detail'],
  { revalidate: 60, tags: ['news'] },
);

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-content');
    if (limited) return limited;

    const { slug } = await params;

    const post = await getCachedNewsDetail(slug);

    if (!post) {
      return NextResponse.json({ error: 'Berita/kegiatan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Get public news detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
