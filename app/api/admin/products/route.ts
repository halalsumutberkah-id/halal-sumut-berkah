import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        umkm: { select: { businessName: true, ownerName: true } },
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Get admin products error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
