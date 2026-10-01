// app/api/admin/banner-settings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

const updateSchema = z.object({
  hideDurationHours: z.number().int().min(1, 'Durasi minimal 1 jam'),
});

async function getOrCreateSettings() {
  const existing = await prisma.bannerSettings.findFirst();
  if (existing) return existing;
  return prisma.bannerSettings.create({ data: {} });
}

export async function GET() {
  try {
    await requireRole('super_admin');

    const settings = await getOrCreateSettings();

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Get banner settings error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireRole('super_admin');

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const settings = await getOrCreateSettings();

    const updated = await prisma.bannerSettings.update({
      where: { id: settings.id },
      data: { hideDurationHours: parsed.data.hideDurationHours },
    });

    revalidateTag('banners', { expire: 0 });

    return NextResponse.json({ message: 'Pengaturan berhasil disimpan', data: updated });
  } catch (error) {
    console.error('Update banner settings error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
