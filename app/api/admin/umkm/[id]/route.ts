// app/api/admin/umkm/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateUmkmProfileSchema } from '@/schemas/umkm-profile.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const umkm = await prisma.umkmProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        businessCategory: { select: { name: true } },
        products: {
          select: {
            id: true,
            name: true,
            photoUrl: true,
            halalStatus: true,
            verificationStatus: true,
            isPublished: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!umkm) {
      return NextResponse.json({ error: 'UMKM tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: umkm });
  } catch (error) {
    console.error('Get admin umkm detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

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

    const updated = await prisma.umkmProfile.update({
      where: { id },
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
        logoUrl: data.logoUrl || null,
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

    return NextResponse.json({ message: 'Data UMKM berhasil diperbarui', data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'UMKM tidak ditemukan' }, { status: 404 });
    }
    console.error('Update admin umkm error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const umkm = await prisma.umkmProfile.findUnique({ where: { id }, select: { userId: true } });
    if (!umkm) {
      return NextResponse.json({ error: 'UMKM tidak ditemukan' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id: umkm.userId } });

    return NextResponse.json({ message: 'UMKM berhasil dihapus' });
  } catch (error) {
    console.error('Delete admin umkm error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
