// app/api/admin/education/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { educationContentSchema } from '@/schemas/content.schema';
import { toLower } from '@/lib/text';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const posts = await prisma.education.findMany({
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json({ data: posts });
  } catch (error) {
    console.error('Get admin education list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('super_admin');

    const body = await req.json();
    const parsed = educationContentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, category, thumbnail, content, isPublished } = parsed.data;
    const lowerTitle = toLower(title);
    const slug = generateSlug(lowerTitle);

    const existing = await prisma.education.findUnique({ where: { slug } });

    if (existing) {
      return NextResponse.json({ error: 'Judul artikel sudah dipakai' }, { status: 409 });
    }

    const post = await prisma.education.create({
      data: {
        authorId: user.id,
        title: lowerTitle,
        slug,
        category,
        thumbnail,
        content,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    revalidateTag('education', { expire: 0 });

    return NextResponse.json({ message: 'Artikel edukasi berhasil dibuat', data: post }, { status: 201 });
  } catch (error) {
    console.error('Create education error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
