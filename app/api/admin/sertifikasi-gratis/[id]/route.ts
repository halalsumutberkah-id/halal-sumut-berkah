// app/api/admin/sertifikasi-gratis/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const submission = await prisma.sertifikasiGratisSubmission.findUnique({
      where: { id },
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

    if (!submission) {
      return NextResponse.json({ error: 'Pengajuan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: submission });
  } catch (error) {
    console.error('Get admin sertifikasi-gratis detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
