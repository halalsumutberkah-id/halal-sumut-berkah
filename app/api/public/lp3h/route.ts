// app/api/public/lp3h/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

export async function GET() {
  try {
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
