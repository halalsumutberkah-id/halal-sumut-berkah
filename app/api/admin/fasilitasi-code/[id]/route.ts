// app/api/admin/fasilitasi-code/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateFasilitasiCodeSchema } from '@/schemas/fasilitasi-code.schema';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const body = await req.json();
    const parsed = updateFasilitasiCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    // kuota tidak boleh diturunkan sampai di bawah jumlah submission yang
    // SUDAH terlanjur pakai kode ini - biar gak ada assignment lama yang
    // jadi "melebihi kuota" cuma gara-gara Admin ngedit angka
    const usedCount = await prisma.sertifikasiGratisSubmission.count({ where: { fasilitasiCodeId: id } });
    if (parsed.data.quota < usedCount) {
      return NextResponse.json({ error: `Kuota tidak boleh kurang dari ${usedCount} (jumlah yang sudah terpakai)` }, { status: 400 });
    }

    const updated = await prisma.fasilitasiCode.update({
      where: { id },
      data: {
        code: parsed.data.code.toUpperCase(),
        quota: parsed.data.quota,
        isActive: parsed.data.isActive,
      },
    });

    return NextResponse.json({ message: 'Kode Fasilitasi berhasil diperbarui', data: updated });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Kode Fasilitasi tidak ditemukan' }, { status: 404 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode ini sudah pernah dipakai' }, { status: 400 });
    }
    console.error('Update fasilitasi-code error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const usedCount = await prisma.sertifikasiGratisSubmission.count({ where: { fasilitasiCodeId: id } });
    if (usedCount > 0) {
      return NextResponse.json({ error: 'Kode Fasilitasi tidak bisa dihapus karena sudah dipakai di pengajuan yang ada' }, { status: 400 });
    }

    await prisma.fasilitasiCode.delete({ where: { id } });

    return NextResponse.json({ message: 'Kode Fasilitasi berhasil dihapus' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Kode Fasilitasi tidak ditemukan' }, { status: 404 });
    }
    console.error('Delete fasilitasi-code error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
