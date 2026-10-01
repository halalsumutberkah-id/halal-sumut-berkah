// app/api/admin/lp3h/[id]/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateLp3hProfileSchema } from '@/schemas/lp3h-profile.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const profile = await prisma.lp3hProfile.findUnique({ where: { id } });

    if (!profile) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Get admin lp3h profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.lp3hProfile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateLp3hProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['officeKabupaten', 'logoUrl', 'contactEmail', 'bio', 'pjEmail', 'pjKtpUrl', 'pjNik', 'pjJenisKelamin', 'registrationDocumentUrl']);

    // pastikan email kontak publik tidak dipakai LP3H lain
    const emailTaken = await prisma.lp3hProfile.findFirst({
      where: { contactEmail: data.contactEmail, id: { not: id } },
    });
    if (emailTaken) {
      return NextResponse.json({ error: 'Email kontak ini sudah dipakai LP3H lain' }, { status: 400 });
    }

    const updated = await prisma.lp3hProfile.update({
      where: { id },
      data: {
        name: data.name,
        jenisLembaga: data.jenisLembaga,
        lembagaInduk: data.lembagaInduk,
        officeKecamatan: data.officeKecamatan,
        officeKabupaten: data.officeKabupaten,
        officeAddress: data.officeAddress,
        phone: data.phone,
        contactEmail: data.contactEmail,
        logoUrl: data.logoUrl || null,
        bio: data.bio || null,
        // Data Penanggung Jawab/Admin LP3H
        pjName: data.pjName,
        pjNik: data.pjNik,
        pjEmail: data.pjEmail,
        pjJabatan: data.pjJabatan,
        pjJenisKelamin: data.pjJenisKelamin,
        pjPhone: data.pjPhone,
        pjKtpUrl: data.pjKtpUrl,
        // Legalitas - Admin bisa override di sini juga (selain lewat
        // /legality), dua-duanya nulis ke kolom yang sama
        registrationDocumentUrl: data.registrationDocumentUrl,
      },
    });

    await prisma.user.update({ where: { id: existing.userId }, data: { name: data.name } });

    return NextResponse.json({ message: 'Profil LP3H berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update admin lp3h profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
