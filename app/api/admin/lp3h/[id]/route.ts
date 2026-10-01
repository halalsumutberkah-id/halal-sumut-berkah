// app/api/admin/lp3h/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateLp3hSchema } from '@/schemas/lp3h.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const lp3h = await prisma.lp3hProfile.findUnique({
      where: { id },
      include: {
        user: { select: { email: true } },
        pendampings: { select: { id: true, name: true, phone: true } },
      },
    });

    if (!lp3h) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: lp3h });
  } catch (error) {
    console.error('Get lp3h detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const body = await req.json();
    const parsed = updateLp3hSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['logoUrl', 'description']);

    const lp3h = await prisma.lp3hProfile.findUnique({ where: { id } });

    if (!lp3h) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.lp3hProfile.update({
      where: { id },
      data,
    });

    // nama LP3H juga dipakai sebagai nama user, disamakan biar konsisten
    await prisma.user.update({
      where: { id: lp3h.userId },
      data: { name: data.name },
    });

    return NextResponse.json({ message: 'Data LP3H berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update lp3h error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const lp3h = await prisma.lp3hProfile.findUnique({
      where: { id },
      include: { _count: { select: { pendampings: true } } },
    });

    if (!lp3h) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    if (lp3h._count.pendampings > 0) {
      return NextResponse.json({ error: 'LP3H tidak bisa dihapus karena masih memiliki data Pendamping' }, { status: 400 });
    }

    // hapus user sekaligus menghapus lp3hProfile (cascade)
    await prisma.user.delete({ where: { id: lp3h.userId } });

    return NextResponse.json({ message: 'LP3H berhasil dihapus' });
  } catch (error) {
    console.error('Delete lp3h error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
