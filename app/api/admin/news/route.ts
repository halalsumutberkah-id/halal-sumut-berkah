// app/api/admin/news/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { contentSchema } from '@/schemas/content.schema';
import { toLower } from '@/lib/text';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const posts = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error('Get news list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('super_admin');

    const body = await req.json();
    const parsed = contentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, thumbnail, content, isPublished } = parsed.data;
    const lowerTitle = toLower(title);
    const slug = generateSlug(lowerTitle);

    const duplicate = await prisma.news.findFirst({ where: { slug } });
    if (duplicate) {
      return NextResponse.json({ error: 'Judul sudah dipakai' }, { status: 409 });
    }

    const created = await prisma.news.create({
      data: {
        authorId: user.id,
        title: lowerTitle,
        slug,
        thumbnail,
        content,
        isPublished,
        ...(isPublished && { publishedAt: new Date() }),
      },
    });

    revalidateTag('news', { expire: 0 });

    return NextResponse.json({ message: 'Berita/kegiatan berhasil dibuat', data: created }, { status: 201 });
  } catch (error) {
    console.error('Create news error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
