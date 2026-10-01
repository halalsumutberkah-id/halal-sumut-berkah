// app/api/lp3h/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateLp3hProfileSchema } from '@/schemas/lp3h-profile.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole('lp3h');

    const profile = await prisma.lp3hProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil LP3H tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Get lp3h profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole('lp3h');

    const existing = await prisma.lp3hProfile.findUnique({ where: { userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Profil LP3H tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateLp3hProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['officeKabupaten', 'logoUrl', 'contactEmail', 'bio', 'pjEmail', 'pjKtpUrl', 'pjNik', 'pjJenisKelamin', 'registrationDocumentUrl']);

    // pastikan email kontak publik tidak dipakai LP3H lain
    if (data.contactEmail) {
      const emailTaken = await prisma.lp3hProfile.findFirst({
        where: { contactEmail: data.contactEmail, id: { not: existing.id } },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email kontak ini sudah dipakai LP3H lain' }, { status: 400 });
      }
    }

    const updated = await prisma.lp3hProfile.update({
      where: { userId: user.id },
      data: {
        name: data.name,
        jenisLembaga: data.jenisLembaga,
        lembagaInduk: data.lembagaInduk || null,
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
        // Legalitas - LP3H sekarang bisa isi/ubah sendiri
        registrationDocumentUrl: data.registrationDocumentUrl,
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { name: data.name } });

    return NextResponse.json({ message: 'Profil berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update lp3h profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
