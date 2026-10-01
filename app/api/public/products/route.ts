// app/api/public/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

// hasil query di-cache per kombinasi search+categoryId selama 60 detik -
// query params bebas jadi tidak bisa full-route cache kayak endpoint
// publik lain, tapi query Prisma-nya sendiri tetap dihemat kalau ada
// banyak pengunjung dengan filter yang sama dalam window waktu itu
const getCachedProducts = unstable_cache(
  async (search: string | undefined, categoryId: string | undefined) => {
    return prisma.product.findMany({
      where: {
        isPublished: true,
        ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        price: true,
        photoUrl: true,
        halalStatus: true,
        category: { select: { name: true } },
        umkm: { select: { businessName: true, slug: true } },
      },
    });
  },
  ['public-products-list'],
  { revalidate: 60 },
);

export async function GET(req: NextRequest) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-content');
    if (limited) return limited;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') ?? undefined;
    const categoryId = searchParams.get('categoryId') ?? undefined;

    const products = await getCachedProducts(search, categoryId);

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Get public products error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
