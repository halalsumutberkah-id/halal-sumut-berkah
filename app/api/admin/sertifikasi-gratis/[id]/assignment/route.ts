// app/api/admin/sertifikasi-gratis/[id]/assignment/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateAssignmentSchema } from '@/schemas/sertifikasi-gratis.schema';
import { sendPendampinganEmail } from '@/lib/sertifikasi-gratis-email';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// D4b - Admin ganti (reassign) atau batalkan (cancel) penugasan Pendamping
// yang SUDAH ditugaskan. Beda dari /verify yang cuma jalan sebelum
// ditugaskan. Endpoint ini CUMA jalan kalau status submission SAAT INI
// persis "ditugaskan" (belum "selesai" - kalau sudah selesai gak boleh
// diutak-atik lagi karena sertifikat halal udah terbit).
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.sertifikasiGratisSubmission.findUnique({
      where: { id },
      include: {
        umkm: { select: { userId: true, businessName: true } },
        pendamping: { select: { id: true, name: true, lp3h: { select: { userId: true } } } },
        products: { include: { product: { select: { name: true } } } },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    if (existing.status !== 'ditugaskan') {
      return NextResponse.json({ error: 'Penugasan cuma bisa diubah selama statusnya masih "Ditugaskan"' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateAssignmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    if (parsed.data.action === 'reassign') {
      const newPendamping = await prisma.pendamping.findUnique({
        where: { id: parsed.data.pendampingId },
        include: { lp3h: { select: { userId: true, name: true, user: { select: { email: true } } } } },
      });
      if (!newPendamping) {
        return NextResponse.json({ error: 'Pendamping tidak ditemukan' }, { status: 400 });
      }

      const updated = await prisma.sertifikasiGratisSubmission.update({
        where: { id },
        data: {
          lp3hId: newPendamping.lp3hId,
          pendampingId: newPendamping.id,
        },
      });

      const notifications = [];

      // kabari LP3H/pendamping LAMA kalau tugasnya dialihkan ke orang lain
      // (kalau sebelumnya ada pendamping & bukan orang yang sama)
      if (existing.pendamping && existing.pendamping.id !== newPendamping.id) {
        notifications.push({
          userId: existing.pendamping.lp3h.userId,
          type: 'sertifikasi_gratis_reassigned',
          title: 'Tugas Self Declare Dialihkan',
          message: `Tugas pendampingan untuk ${existing.umkm.businessName} sudah dialihkan Admin ke Pendamping lain.`,
          link: '/lp3h/sertifikasi-gratis',
        });
      }

      // kabari LP3H/pendamping BARU
      notifications.push({
        userId: newPendamping.lp3h.userId,
        type: 'sertifikasi_gratis_assigned',
        title: 'Tugas Self Declare Baru',
        message: `${existing.umkm.businessName} ditugaskan ke lembaga anda untuk pendampingan Self Declare.`,
        link: '/lp3h/sertifikasi-gratis',
      });

      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }

      // B1d - notifikasi EMAIL ke LP3H yang BARU dapat pengalihan tugas.
      // Gagal kirim email TIDAK BOLEH menggagalkan proses reassign-nya
      // sendiri.
      try {
        await sendPendampinganEmail(
          newPendamping.lp3h.user.email,
          newPendamping.lp3h.name,
          existing.umkm.businessName,
          existing.products.map((p) => p.product.name),
        );
      } catch (emailError) {
        console.error('Send pendampingan email error:', emailError);
      }

      return NextResponse.json({ message: 'Pendamping berhasil diganti', data: updated });
    } else {
      // cancel - balik ke menunggu_verifikasi, LP3H & pendamping dikosongkan
      const updated = await prisma.sertifikasiGratisSubmission.update({
        where: { id },
        data: {
          status: 'menunggu_verifikasi',
          lp3hId: null,
          pendampingId: null,
        },
      });

      const notifications = [];

      if (existing.pendamping) {
        notifications.push({
          userId: existing.pendamping.lp3h.userId,
          type: 'sertifikasi_gratis_cancelled',
          title: 'Penugasan Self Declare Dibatalkan',
          message: `Penugasan pendampingan untuk ${existing.umkm.businessName} dibatalkan oleh Admin.`,
          link: '/lp3h/sertifikasi-gratis',
        });
      }

      notifications.push({
        userId: existing.umkm.userId,
        type: 'sertifikasi_gratis_reverted',
        title: 'Pengajuan Self Declare Diproses Ulang',
        message: 'Penugasan pendampingan untuk pengajuan anda dibatalkan Admin dan akan diproses ulang.',
        link: '/umkm/sertifikasi-gratis',
      });

      await prisma.notification.createMany({ data: notifications });

      return NextResponse.json({ message: 'Penugasan berhasil dibatalkan', data: updated });
    }
  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
