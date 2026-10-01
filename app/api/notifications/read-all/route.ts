import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH() {
  try {
    const user = await requireUser();

    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ message: 'Semua notifikasi ditandai sudah dibaca' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
