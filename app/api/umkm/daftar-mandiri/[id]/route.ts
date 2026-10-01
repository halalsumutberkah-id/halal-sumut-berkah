// app/api/umkm/daftar-mandiri/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('umkm');
    const { id } = await params;

    const submission = await prisma.daftarMandiriSubmission.findFirst({
      where: { id, product: { umkm: { userId: user.id } } },
      include: {
        product: { select: { name: true, photoUrl: true, umkmId: true } },
        lp3h: { select: { name: true, phone: true } },
        pendamping: { select: { name: true, phone: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error('Get umkm daftar-mandiri detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
