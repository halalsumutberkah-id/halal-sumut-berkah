// app/api/admin/umkm/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    // export Excel butuh SEMUA field yang ada di database, bukan cuma
    // yang tampil di tabel - jadi select-nya sengaja dibikin lengkap,
    // bukan cuma kolom yang dipakai UI
    const umkmList = await prisma.umkmProfile.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        ownerName: true,
        ownerNik: true,
        ownerGender: true,
        birthDate: true,
        ownerPhone: true,
        ownerKecamatan: true,
        ownerKabupaten: true,
        ownerAddress: true,
        ktpUrl: true,
        businessName: true,
        logoUrl: true,
        nibNumber: true,
        nibUrl: true,
        establishedYear: true,
        businessKecamatan: true,
        businessKabupaten: true,
        businessAddress: true,
        businessType: true,
        annualRevenue: true,
        businessContactNumber: true,
        createdAt: true,
        businessCategory: { select: { name: true } },
        user: { select: { email: true } },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ data: umkmList });
  } catch (error) {
    console.error('Get admin umkm list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
