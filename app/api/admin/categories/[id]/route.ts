// app/api/admin/categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { categorySchema } from '@/schemas/category.schema';
import { toLower } from '@/lib/text';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const name = toLower(parsed.data.name);
    const slug = generateSlug(name);

    const duplicate = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }], NOT: { id } },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Kategori sudah ada' }, { status: 409 });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: { name, slug },
    });

    revalidateTag('categories', { expire: 0 });

    return NextResponse.json({ message: 'Kategori berhasil diperbarui', data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }
    console.error('Update category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: 'Kategori tidak ditemukan' }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json({ error: 'Kategori tidak bisa dihapus karena masih dipakai produk' }, { status: 400 });
    }

    await prisma.category.delete({ where: { id } });

    revalidateTag('categories', { expire: 0 });

    return NextResponse.json({ message: 'Kategori berhasil dihapus' });
  } catch (error) {
    console.error('Delete category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
