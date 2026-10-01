// app/api/lp3h/pendamping/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { pendampingSchema } from '@/schemas/pendamping.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// gabung cek "lp3h ini ownernya siapa" + "pendamping ini punya lp3h itu
// atau bukan" jadi 1 query pakai nested where, dulu 2 query terpisah
// (findUnique lp3h lalu findUnique pendamping lalu compare di JS)
function getOwnPendamping(userId: string, pendampingId: string) {
  return prisma.pendamping.findFirst({
    where: { id: pendampingId, lp3h: { userId } },
  });
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('lp3h');
    const { id } = await params;

    const existing = await getOwnPendamping(user.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Pendamping tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = pendampingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['phone', 'photoUrl', 'kabupaten', 'ktpUrl', 'registrasiSihalalUrl', 'registrasiBpjphUrl', 'sertifikatPelatihanUrl', 'nikP3h', 'jenisKelamin']);

    if (data.emailP3h) {
      const emailTaken = await prisma.pendamping.findFirst({
        where: { emailP3h: data.emailP3h, id: { not: id } },
      });
      if (emailTaken) {
        return NextResponse.json({ error: 'Email ini sudah dipakai Pendamping lain' }, { status: 400 });
      }
    }

    const updated = await prisma.pendamping.update({
      where: { id },
      data: {
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
        verificationStatus: 'pending',
        adminNote: null,
      },
    });

    return NextResponse.json({ message: 'Pendamping berhasil diperbarui', data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Pendamping tidak ditemukan' }, { status: 404 });
    }
    console.error('Update pendamping error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('lp3h');
    const { id } = await params;

    const existing = await getOwnPendamping(user.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Pendamping tidak ditemukan' }, { status: 404 });
    }

    const submissionCount = await prisma.daftarMandiriSubmission.count({
      where: { pendampingId: id },
    });

    if (submissionCount > 0) {
      return NextResponse.json(
        {
          error: 'Pendamping tidak bisa dihapus karena masih memiliki riwayat pengajuan Daftar Mandiri',
        },
        { status: 400 },
      );
    }

    await prisma.pendamping.delete({ where: { id } });

    return NextResponse.json({ message: 'Pendamping berhasil dihapus' });
  } catch (error) {
    console.error('Delete pendamping error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
