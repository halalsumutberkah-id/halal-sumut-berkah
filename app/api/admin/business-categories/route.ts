// app/api/admin/business-categories/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { businessCategorySchema } from '@/schemas/business-category.schema';
import { lowercaseFields } from '@/lib/text';
import { generateSlug } from '@/lib/utils';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const categories = await prisma.businessCategory.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { umkms: true } } },
    });

    return NextResponse.json({ data: categories });
  } catch (error) {
    console.error('Get business categories error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('super_admin');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const parsed = businessCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, []);

    const existing = await prisma.businessCategory.findUnique({ where: { name: data.name } });
    if (existing) {
      return NextResponse.json({ error: 'Kategori usaha dengan nama ini sudah ada' }, { status: 409 });
    }

    const baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 2;
    while (await prisma.businessCategory.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const category = await prisma.businessCategory.create({
      data: { name: data.name, slug },
    });

    revalidateTag('business-categories', { expire: 0 });

    return NextResponse.json({ message: 'Kategori usaha berhasil ditambahkan', data: category }, { status: 201 });
  } catch (error) {
    console.error('Create business category error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
