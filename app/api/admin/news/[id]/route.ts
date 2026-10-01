// app/api/admin/news/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { contentSchema } from '@/schemas/content.schema';
import { toLower } from '@/lib/text';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const post = await prisma.news.findUnique({ where: { id } });

    if (!post) {
      return NextResponse.json({ error: 'Berita/kegiatan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: post });
  } catch (error) {
    console.error('Get news detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const body = await req.json();
    const parsed = contentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { title, thumbnail, content, isPublished } = parsed.data;
    const lowerTitle = toLower(title);
    const slug = generateSlug(lowerTitle);

    const duplicate = await prisma.news.findFirst({
      where: { slug, NOT: { id } },
    });

    if (duplicate) {
      return NextResponse.json({ error: 'Judul sudah dipakai' }, { status: 409 });
    }

    const post = await prisma.news.findUnique({ where: { id }, select: { isPublished: true } });
    if (!post) {
      return NextResponse.json({ error: 'Berita/kegiatan tidak ditemukan' }, { status: 404 });
    }

    const shouldSetPublishedAt = isPublished && !post.isPublished;

    const updated = await prisma.news.update({
      where: { id },
      data: {
        title: lowerTitle,
        slug,
        thumbnail,
        content,
        isPublished,
        ...(shouldSetPublishedAt && { publishedAt: new Date() }),
      },
    });

    revalidateTag('news', { expire: 0 });

    return NextResponse.json({ message: 'Berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update news error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    await prisma.news.delete({ where: { id } });

    revalidateTag('news', { expire: 0 });

    return NextResponse.json({ message: 'Berhasil dihapus' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Berita/kegiatan tidak ditemukan' }, { status: 404 });
    }
    console.error('Delete news error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
