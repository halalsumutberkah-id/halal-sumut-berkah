// app/api/notifications/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireUser();

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    return NextResponse.json({ data: notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
