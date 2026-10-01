// app/api/public/banners/route.ts

import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const getCachedBanners = unstable_cache(
  async () => {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { sequence: 'asc' },
      select: { id: true, imageUrl: true, link: true },
    });

    const settings = await prisma.bannerSettings.findFirst();
    const hideDurationHours = settings?.hideDurationHours ?? 24;

    return { banners, hideDurationHours };
  },
  ['public-banners'],
  { revalidate: 60, tags: ['banners'] },
);

export async function GET() {
  try {
    const { banners, hideDurationHours } = await getCachedBanners();

    return NextResponse.json({ data: banners, hideDurationHours });
  } catch (error) {
    console.error('Get public banners error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
