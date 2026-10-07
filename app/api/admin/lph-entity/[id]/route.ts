// app/api/admin/lph-entity/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { lphEntitySchema } from '@/schemas/lph-entity.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const body = await req.json();
    const parsed = lphEntitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['kabupaten', 'description', 'registrationNumberBpjph', 'contactWhatsapp', 'inspectionScope']);

    // langsung update tanpa cek exist dulu - kalau row tidak ada, Prisma
    // otomatis throw P2025, ditangkap di catch jadi 404. Hemat 1 query
    // dibanding findUnique + update terpisah
    const updated = await prisma.lph.update({
      where: { id },
      data: {
        ...data,
        email: data.email || null,
        registrationNumberBpjph: data.registrationNumberBpjph || null,
        skValidUntil: data.skValidUntil ? new Date(data.skValidUntil) : null,
        inspectionScope: data.inspectionScope || null,
        contactWhatsapp: data.contactWhatsapp || null,
      },
    });

    return NextResponse.json({ message: 'LPH berhasil diperbarui', data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'LPH tidak ditemukan' }, { status: 404 });
    }
    console.error('Update lph error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    await prisma.lph.delete({ where: { id } });

    return NextResponse.json({ message: 'LPH berhasil dihapus' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'LPH tidak ditemukan' }, { status: 404 });
    }
    console.error('Delete lph error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
