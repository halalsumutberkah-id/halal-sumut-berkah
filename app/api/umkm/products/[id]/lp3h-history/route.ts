// app/api/umkm/products/[id]/lp3h-history/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('umkm');
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, umkm: { userId: user.id } },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const submissions = await prisma.daftarMandiriSubmission.findMany({
      where: { productId: id },
      distinct: ['lp3hId'],
      select: { lp3h: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ data: submissions.map((s) => s.lp3h) });
  } catch (error) {
    console.error('Get product lp3h history error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
