// app/api/umkm/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateUmkmProfileSchema } from '@/schemas/umkm-profile.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole('umkm');

    const profile = await prisma.umkmProfile.findUnique({
      where: { userId: user.id },
      include: {
        businessCategory: { select: { id: true, name: true } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Get umkm profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole('umkm');

    const body = await req.json();
    const parsed = updateUmkmProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['ownerNik', 'birthDate', 'ownerPhone', 'ownerKabupaten', 'ktpUrl', 'logoUrl', 'nibNumber', 'nibUrl', 'businessKabupaten', 'businessCategoryId', 'businessContactNumber', 'annualRevenue']);

    const businessCategory = await prisma.businessCategory.findUnique({
      where: { id: data.businessCategoryId },
    });
    if (!businessCategory) {
      return NextResponse.json({ error: 'Kategori usaha tidak valid' }, { status: 404 });
    }

    // langsung update tanpa findUnique dulu - kalau profil belum ada,
    // Prisma throw P2025, ditangkap di catch jadi 404
    const updated = await prisma.umkmProfile.update({
      where: { userId: user.id },
      data: {
        ownerName: data.ownerName,
        ownerNik: data.ownerNik,
        birthDate: new Date(data.birthDate),
        ownerPhone: data.ownerPhone,
        ownerKecamatan: data.ownerKecamatan,
        ownerKabupaten: data.ownerKabupaten,
        ownerAddress: data.ownerAddress,
        ktpUrl: data.ktpUrl,

        businessName: data.businessName,
        logoUrl: data.logoUrl,
        nibNumber: data.nibNumber,
        nibUrl: data.nibUrl,
        establishedYear: data.establishedYear,
        businessKecamatan: data.businessKecamatan,
        businessKabupaten: data.businessKabupaten,
        businessAddress: data.businessAddress,
        businessType: data.businessType,
        businessCategoryId: data.businessCategoryId,
        annualRevenue: data.annualRevenue,
        businessContactNumber: data.businessContactNumber,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { name: data.ownerName },
    });

    return NextResponse.json({ message: 'Profil berhasil diperbarui', data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }
    console.error('Update umkm profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
