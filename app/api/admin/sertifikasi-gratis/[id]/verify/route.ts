// app/api/admin/sertifikasi-gratis/[id]/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { verifySertifikasiGratisSchema } from '@/schemas/sertifikasi-gratis.schema';
import { sendPendampinganEmail } from '@/lib/sertifikasi-gratis-email';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.sertifikasiGratisSubmission.findUnique({
      where: { id },
      include: {
        umkm: { select: { userId: true, businessName: true } },
        products: { include: { product: { select: { name: true } } } },
      },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    if (existing.status !== 'menunggu_verifikasi') {
      return NextResponse.json({ error: 'Pengajuan ini sudah diproses sebelumnya' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = verifySertifikasiGratisSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    if (parsed.data.status === 'ditugaskan') {
      // pendampingId opsional dari Admin - kalau gak dikirim, pakai
      // pendamping yang SUDAH DIPILIH UMKM sendiri pas submit (existing.pendampingId).
      // Admin cuma perlu kirim pendampingId kalau mau assign manual /
      // override pilihan UMKM.
      const pendampingId = parsed.data.pendampingId ?? existing.pendampingId;

      if (!pendampingId) {
        return NextResponse.json({ error: 'Pendamping wajib dipilih (UMKM belum memilih Pendamping saat pengajuan)' }, { status: 400 });
      }

      const pendamping = await prisma.pendamping.findUnique({
        where: { id: pendampingId },
        include: { lp3h: { select: { userId: true, name: true, user: { select: { email: true } } } } },
      });
      if (!pendamping) {
        return NextResponse.json({ error: 'Pendamping tidak ditemukan' }, { status: 400 });
      }

      // lp3hId TIDAK PERNAH diminta manual - selalu ikut LP3H tempat
      // pendamping ini bernaung, jadi gak mungkin ada mismatch
      const updated = await prisma.sertifikasiGratisSubmission.update({
        where: { id },
        data: {
          status: 'ditugaskan',
          lp3hId: pendamping.lp3hId,
          pendampingId: pendamping.id,
        },
      });

      // notifikasi ke UMKM (pengajuannya ditugaskan) + LP3H (dapat tugas
      // baru)
      await prisma.notification.createMany({
        data: [
          {
            userId: existing.umkm.userId,
            type: 'sertifikasi_gratis_ditugaskan',
            title: 'Pengajuan Self Declare Ditugaskan',
            message: `Pengajuan anda telah disetujui dan ditugaskan ke LP3H untuk proses pendampingan.`,
            link: '/umkm/sertifikasi-gratis',
          },
          {
            userId: pendamping.lp3h.userId,
            type: 'sertifikasi_gratis_assigned',
            title: 'Tugas Self Declare Baru',
            message: `${existing.umkm.businessName} ditugaskan ke lembaga anda untuk pendampingan Self Declare.`,
            link: '/lp3h/sertifikasi-gratis',
          },
        ],
      });

      // B1d - notifikasi EMAIL ke LP3H saat Admin resmi menugaskan. Gagal
      // kirim email TIDAK BOLEH menggagalkan proses verifikasinya sendiri.
      try {
        await sendPendampinganEmail(
          pendamping.lp3h.user.email,
          pendamping.lp3h.name,
          existing.umkm.businessName,
          existing.products.map((p) => p.product.name),
        );
      } catch (emailError) {
        console.error('Send pendampingan email error:', emailError);
      }

      return NextResponse.json({ message: 'Pengajuan berhasil ditugaskan', data: updated });
    } else {
      const updated = await prisma.sertifikasiGratisSubmission.update({
        where: { id },
        data: { status: 'ditolak', adminNote: parsed.data.adminNote },
      });

      await prisma.notification.create({
        data: {
          userId: existing.umkm.userId,
          type: 'sertifikasi_gratis_ditolak',
          title: 'Pengajuan Self Declare Ditolak',
          message: `Pengajuan anda ditolak. Silakan periksa catatan Admin dan ajukan ulang.`,
          link: '/umkm/sertifikasi-gratis',
        },
      });

      return NextResponse.json({ message: 'Pengajuan berhasil ditolak', data: updated });
    }
  } catch (error) {
    console.error('Verify sertifikasi-gratis error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
