// app/api/umkm/products/[id]/publish/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { publishProductSchema } from '@/schemas/publish-product.schema';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('umkm');
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, umkm: { userId: user.id } },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (product.verificationStatus !== 'terverifikasi') {
      return NextResponse.json({ error: 'Produk harus terverifikasi Admin terlebih dahulu sebelum bisa dipublikasikan' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = publishProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    let publishedLp3hId: string | null = null;
    if (parsed.data.lp3hId) {
      const lp3h = await prisma.lp3hProfile.findUnique({ where: { id: parsed.data.lp3hId } });
      if (!lp3h) {
        return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
      }
      publishedLp3hId = lp3h.id;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        isPublished: true,
        publishedLp3hId,
        agreedResponsibility: parsed.data.agreedResponsibility,
        agreedPublicationConsent: parsed.data.agreedPublicationConsent,
      },
    });

    return NextResponse.json({
      message: 'Produk berhasil dipublikasikan ke katalog',
      data: updated,
    });
  } catch (error) {
    console.error('Publish product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
