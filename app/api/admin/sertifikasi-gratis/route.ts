// app/api/admin/sertifikasi-gratis/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const submissions = await prisma.sertifikasiGratisSubmission.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        umkm: {
          select: {
            businessName: true,
            ownerName: true,
            ownerNik: true,
            ownerGender: true,
            birthDate: true,
            ownerPhone: true,
            ownerKecamatan: true,
            ownerKabupaten: true,
            ownerAddress: true,
            ktpUrl: true,
            nibNumber: true,
            nibUrl: true,
            establishedYear: true,
            businessKecamatan: true,
            businessKabupaten: true,
            businessAddress: true,
            businessType: true,
            annualRevenue: true,
            businessContactNumber: true,
            businessCategory: { select: { name: true } },
          },
        },
        products: { include: { product: { select: { id: true, name: true, photoUrl: true, price: true, halalStatus: true, category: { select: { name: true } } } } } },
        lp3h: { select: { name: true } },
        pendamping: { select: { name: true } },
        fasilitasiCode: { select: { code: true } },
      },
    });

    return NextResponse.json({ data: submissions });
  } catch (error) {
    console.error('Get admin sertifikasi-gratis list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
