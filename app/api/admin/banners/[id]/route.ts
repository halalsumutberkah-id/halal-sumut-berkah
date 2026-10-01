// app/api/admin/banners/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { bannerSchema } from '@/schemas/banner.schema';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const newSeq = parsed.data.sequence;

    const updated = await prisma.$transaction(async (tx) => {
      if (newSeq !== existing.sequence) {
        if (newSeq < existing.sequence) {
          await tx.banner.updateMany({
            where: {
              id: { not: id },
              sequence: { gte: newSeq, lt: existing.sequence },
            },
            data: { sequence: { increment: 1 } },
          });
        } else {
          await tx.banner.updateMany({
            where: {
              id: { not: id },
              sequence: { gt: existing.sequence, lte: newSeq },
            },
            data: { sequence: { decrement: 1 } },
          });
        }
      }

      return tx.banner.update({
        where: { id },
        data: {
          imageUrl: parsed.data.imageUrl,
          link: parsed.data.link || null,
          sequence: newSeq,
          isActive: parsed.data.isActive,
        },
      });
    });

    revalidateTag('banners', { expire: 0 });

    return NextResponse.json({ message: 'Banner berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update banner error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    await prisma.banner.delete({ where: { id } });

    revalidateTag('banners', { expire: 0 });

    return NextResponse.json({ message: 'Banner berhasil dihapus' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Banner tidak ditemukan' }, { status: 404 });
    }
    console.error('Delete banner error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
