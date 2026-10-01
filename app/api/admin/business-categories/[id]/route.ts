// app/api/admin/business-categories/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { businessCategorySchema } from '@/schemas/business-category.schema';
import { lowercaseFields } from '@/lib/text';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.businessCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Kategori usaha tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = businessCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, []);

    const duplicate = await prisma.businessCategory.findFirst({
      where: { name: data.name, NOT: { id } },
    });
    if (duplicate) {
      return NextResponse.json({ error: 'Kategori usaha dengan nama ini sudah ada' }, { status: 409 });
    }

    let slug = existing.slug;
    if (data.name !== existing.name) {
      const baseSlug = generateSlug(data.name);
      slug = baseSlug;
      let counter = 2;
      while (await prisma.businessCategory.findFirst({ where: { slug, NOT: { id } } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const updated = await prisma.businessCategory.update({
      where: { id },
      data: { name: data.name, slug },
    });

    revalidateTag('business-categories', { expire: 0 });

    return NextResponse.json({ message: 'Kategori usaha berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update business category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.businessCategory.findUnique({
      where: { id },
      include: { _count: { select: { umkms: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kategori usaha tidak ditemukan' }, { status: 404 });
    }

    if (existing._count.umkms > 0) {
      return NextResponse.json({ error: 'Kategori usaha tidak bisa dihapus karena masih dipakai oleh UMKM' }, { status: 400 });
    }

    await prisma.businessCategory.delete({ where: { id } });

    revalidateTag('business-categories', { expire: 0 });

    return NextResponse.json({ message: 'Kategori usaha berhasil dihapus' });
  } catch (error) {
    console.error('Delete business category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
