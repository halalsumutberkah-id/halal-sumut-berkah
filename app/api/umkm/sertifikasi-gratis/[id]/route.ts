// app/api/umkm/sertifikasi-gratis/[id]/route.ts

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

    // 1 query nested where, dulu 2 query terpisah (findUnique umkm lalu
    // findUnique submission lalu compare di JS)
    const submission = await prisma.sertifikasiGratisSubmission.findFirst({
      where: { id, umkm: { userId: user.id } },
      include: {
        products: { include: { product: { select: { id: true, name: true, photoUrl: true } } } },
        lp3h: { select: { name: true, phone: true } },
        // data lengkap Pendamping (C2a) - dipakai buat kartu kontak +
        // tombol WhatsApp di detail sheet
        pendamping: { select: { name: true, phone: true, photoUrl: true, emailP3h: true, kecamatan: true, kabupaten: true } },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error('Get umkm sertifikasi-gratis detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
