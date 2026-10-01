// app/api/admin/pendamping/[id]/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const verifySchema = z.object({
  verificationStatus: z.enum(['terverifikasi', 'ditolak']),
  adminNote: z.string().optional().or(z.literal('')),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.pendamping.findUnique({
      where: { id },
      include: { lp3h: { select: { userId: true, name: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Pendamping tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    // tolak wajib disertai catatan, biar LP3H tahu apa yang perlu
    // diperbaiki
    if (parsed.data.verificationStatus === 'ditolak' && !parsed.data.adminNote) {
      return NextResponse.json({ error: 'Catatan wajib diisi kalau menolak' }, { status: 400 });
    }

    const statusChanged = existing.verificationStatus !== parsed.data.verificationStatus;

    const updated = await prisma.pendamping.update({
      where: { id },
      data: {
        verificationStatus: parsed.data.verificationStatus,
        adminNote: parsed.data.adminNote || null,
      },
    });

    // notifikasi ke LP3H CUMA kalau statusnya BENERAN berubah - biar tidak
    // spam kalau Admin klik simpan ulang tanpa ganti status
    if (statusChanged) {
      await prisma.notification.create({
        data: {
          userId: existing.lp3h.userId,
          type: 'pendamping_verified',
          title: parsed.data.verificationStatus === 'terverifikasi' ? 'Pendamping Terverifikasi' : 'Pendamping Ditolak',
          message: parsed.data.verificationStatus === 'terverifikasi' ? `Data Pendamping ${existing.name} telah diverifikasi Admin.` : `Data Pendamping ${existing.name} ditolak Admin. Silakan periksa catatan dan perbaiki datanya.`,
          link: '/lp3h/pendamping',
        },
      });
    }

    return NextResponse.json({ message: 'Status verifikasi berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Verify pendamping error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
