// app/api/admin/banners/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { bannerSchema } from '@/schemas/banner.schema';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const banners = await prisma.banner.findMany({
      orderBy: { sequence: 'asc' },
    });

    return NextResponse.json({ data: banners });
  } catch (error) {
    console.error('Get banners error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('super_admin');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const targetSeq = parsed.data.sequence;

    const banner = await prisma.$transaction(async (tx) => {
      await tx.banner.updateMany({
        where: { sequence: { gte: targetSeq } },
        data: { sequence: { increment: 1 } },
      });

      return tx.banner.create({
        data: {
          imageUrl: parsed.data.imageUrl,
          link: parsed.data.link || null,
          sequence: targetSeq,
          isActive: parsed.data.isActive,
        },
      });
    });

    revalidateTag('banners', { expire: 0 });

    return NextResponse.json({ message: 'Banner berhasil ditambahkan', data: banner }, { status: 201 });
  } catch (error) {
    console.error('Create banner error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
