// app/api/admin/categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { categorySchema } from '@/schemas/category.schema';
import { toLower } from '@/lib/text';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('super_admin');

    const body = await req.json();
    const parsed = categorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const name = toLower(parsed.data.name);
    const slug = generateSlug(name);

    const existing = await prisma.category.findFirst({
      where: { OR: [{ name }, { slug }] },
    });

    if (existing) {
      return NextResponse.json({ error: 'Kategori sudah ada' }, { status: 409 });
    }

    const category = await prisma.category.create({
      data: { name, slug },
    });

    revalidateTag('categories', { expire: 0 });

    return NextResponse.json({ message: 'Kategori berhasil dibuat', data: category }, { status: 201 });
  } catch (error) {
    console.error('Create category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
