// app/api/public/products/[id]/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, isPublished: true },
      select: {
        id: true,
        name: true,
        price: true,
        shortDescription: true,
        advantages: true,
        ingredients: true,
        photoUrl: true,
        halalStatus: true,
        halalCertNumber: true,
        category: { select: { name: true } },
        umkm: {
          select: {
            businessName: true,
            slug: true,
            logoUrl: true,
            businessKabupaten: true,
          },
        },
        publishedLp3h: { select: { name: true, slug: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Get public product detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
