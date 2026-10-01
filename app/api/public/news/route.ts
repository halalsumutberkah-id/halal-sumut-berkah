import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 9;

const SORT_OPTIONS = {
  newest: { publishedAt: 'desc' as const },
  oldest: { publishedAt: 'asc' as const },
  az: { title: 'asc' as const },
  za: { title: 'desc' as const },
};

export async function GET(req: NextRequest) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-content');
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const search = searchParams.get('search')?.trim() ?? '';
    const sortParam = searchParams.get('sort') ?? 'newest';
    const orderBy = SORT_OPTIONS[sortParam as keyof typeof SORT_OPTIONS] ?? SORT_OPTIONS.newest;

    // pencarian & sorting dilakukan LANGSUNG di query database (bukan
    // ambil semua data terus filter di JS) - biar tidak menarik seluruh
    // baris dari db tiap kali ada yang buka halaman ini
    const where = {
      isPublished: true,
      ...(search && { title: { contains: search, mode: 'insensitive' as const } }),
    };

    const [posts, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnail: true,
          content: true,
          publishedAt: true,
        },
      }),
      prisma.news.count({ where }),
    ]);

    return NextResponse.json({
      data: posts,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (error) {
    console.error('Get public news list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
