// app/api/public/lp3h/[id]/pendamping/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const pendampingList = await prisma.pendamping.findMany({
      where: { lp3hId: id },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, photoUrl: true, phone: true },
    });

    return NextResponse.json({ data: pendampingList });
  } catch (error) {
    console.error('Get public pendamping list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
