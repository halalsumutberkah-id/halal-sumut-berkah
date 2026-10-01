// app/api/public/pendamping/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const revalidate = 300;

const ACTIVE_SERTIFIKASI_GRATIS = ['ditugaskan'];

export async function GET() {
  try {
    const pendampingList = await prisma.pendamping.findMany({
      where: { verificationStatus: 'terverifikasi' },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        photoUrl: true,
        phone: true,
        kecamatan: true,
        kabupaten: true,
        lp3h: { select: { id: true, name: true } },
        _count: { select: { sertifikasiGratisSubmissions: { where: { status: { in: ACTIVE_SERTIFIKASI_GRATIS } } } } },
      },
    });

    const data = pendampingList.map((p) => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photoUrl,
      phone: p.phone,
      kecamatan: p.kecamatan,
      kabupaten: p.kabupaten,
      lp3h: p.lp3h,
      activeUmkmCount: p._count.sertifikasiGratisSubmissions,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get public pendamping list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
