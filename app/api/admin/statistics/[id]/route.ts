// app/api/admin/statistics/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { revalidatePath, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { statisticSchema } from '@/schemas/statistic.schema';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('super_admin');
    const { id } = await params;

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const parsed = statisticSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const duplicate = await prisma.halalStatistic.findFirst({
      where: {
        period: parsed.data.period,
        kabupaten: parsed.data.kabupaten,
        NOT: { id },
      },
    });
    if (duplicate) {
      return NextResponse.json({ error: 'Data untuk periode dan kabupaten ini sudah ada' }, { status: 409 });
    }

    const statistic = await prisma.halalStatistic.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath('/tentang-kami');
    revalidateTag('statistics', { expire: 0 });

    return NextResponse.json({ message: 'Data statistik berhasil diperbarui', data: statistic });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Data statistik tidak ditemukan' }, { status: 404 });
    }
    console.error('Update statistic error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('super_admin');
    const { id } = await params;

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    await prisma.halalStatistic.delete({ where: { id } });

    revalidatePath('/tentang-kami');
    revalidateTag('statistics', { expire: 0 });

    return NextResponse.json({ message: 'Data statistik berhasil dihapus' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Data statistik tidak ditemukan' }, { status: 404 });
    }
    console.error('Delete statistic error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
