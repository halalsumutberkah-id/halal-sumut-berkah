// app/api/admin/pendamping/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

const ACTIVE_SERTIFIKASI_GRATIS = ['ditugaskan'];

export async function GET() {
  try {
    await requireRole('super_admin');

    const pendampingList = await prisma.pendamping.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        lp3h: { select: { name: true } },
        // beban kerja - jumlah UMKM yang SEDANG AKTIF didampingi (status
        // "ditugaskan"), bukan seluruh riwayat sepanjang masa
        _count: { select: { sertifikasiGratisSubmissions: { where: { status: { in: ACTIVE_SERTIFIKASI_GRATIS } } } } },
      },
    });

    return NextResponse.json({ data: pendampingList });
  } catch (error) {
    console.error('Get admin pendamping list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
