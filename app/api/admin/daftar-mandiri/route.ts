// app/api/admin/daftar-mandiri/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const submissions = await prisma.daftarMandiriSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { name: true, umkm: { select: { businessName: true } } } },
        lp3h: { select: { name: true } },
        pendamping: { select: { name: true } },
      },
    });

    return NextResponse.json({ data: submissions });
  } catch (error) {
    console.error('Get admin daftar-mandiri list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
