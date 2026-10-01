// app/api/lp3h/pendamping/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { pendampingSchema } from '@/schemas/pendamping.schema';
import { lowercaseFields } from '@/lib/text';
import { enforceRateLimit } from '@/lib/rate-limit';
import { isLp3hProfileComplete } from '@/lib/lp3h-profile-completeness';
import { toTitleCase } from '@/lib/title-case';
import { getAdminIds } from '@/lib/get-admin-ids';

export const dynamic = 'force-dynamic';

async function getOwnLp3h(userId: string) {
  return prisma.lp3hProfile.findUnique({
    where: { userId },
    select: {
      id: true,
      jenisLembaga: true,
      lembagaInduk: true,
      officeKecamatan: true,
      officeKabupaten: true,
      officeAddress: true,
      contactEmail: true,
    },
  });
}

export async function GET() {
  try {
    const user = await requireRole('lp3h');

    const lp3h = await getOwnLp3h(user.id);
    if (!lp3h) {
      return NextResponse.json({ error: 'Profil LP3H tidak ditemukan' }, { status: 404 });
    }

    const pendampingList = await prisma.pendamping.findMany({
      where: { lp3hId: lp3h.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: pendampingList });
  } catch (error) {
    console.error('Get pendamping list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('lp3h');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const lp3h = await getOwnLp3h(user.id);
    if (!lp3h) {
      return NextResponse.json({ error: 'Profil LP3H tidak ditemukan' }, { status: 404 });
    }

    if (!isLp3hProfileComplete(lp3h)) {
      return NextResponse.json({ error: 'Lengkapi profil lembaga anda terlebih dahulu sebelum menambah Pendamping' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = pendampingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['phone', 'photoUrl', 'kabupaten', 'ktpUrl', 'registrasiSihalalUrl', 'registrasiBpjphUrl', 'sertifikatPelatihanUrl', 'nikP3h', 'jenisKelamin']);

    if (data.emailP3h) {
      const emailTaken = await prisma.pendamping.findFirst({ where: { emailP3h: data.emailP3h } });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email ini sudah dipakai Pendamping lain' }, { status: 400 });
      }
    }

    const pendamping = await prisma.pendamping.create({
      data: {
        lp3hId: lp3h.id,
        name: data.name,
        phone: data.phone,
        photoUrl: data.photoUrl || null,
        nikP3h: data.nikP3h || null,
        jenisKelamin: data.jenisKelamin || null,
        emailP3h: data.emailP3h || null,
        kecamatan: data.kecamatan || null,
        kabupaten: data.kabupaten || null,
        alamatDetail: data.alamatDetail || null,
        ktpUrl: data.ktpUrl || null,
        registrasiSihalalUrl: data.registrasiSihalalUrl,
        registrasiBpjphUrl: data.registrasiBpjphUrl,
        sertifikatPelatihanUrl: data.sertifikatPelatihanUrl,
      },
    });

    const adminIds = await getAdminIds();
    if (adminIds.length > 0) {
      await prisma.notification.createMany({
        data: adminIds.map((adminId) => ({
          userId: adminId,
          type: 'pendamping_submitted',
          title: 'Pendamping Baru Menunggu Verifikasi',
          message: `LP3H mendaftarkan Pendamping baru bernama ${toTitleCase(data.name)}.`,
          link: '/admin/pendamping',
        })),
      });
    }

    return NextResponse.json({ message: 'Pendamping berhasil ditambahkan', data: pendamping }, { status: 201 });
  } catch (error) {
    console.error('Create pendamping error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
