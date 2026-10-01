// app/api/notifications/[id]/read/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const notification = await prisma.notification.findFirst({
      where: { id, userId: user.id },
    });

    if (!notification) {
      return NextResponse.json({ error: 'Notifikasi tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Mark notification read error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
