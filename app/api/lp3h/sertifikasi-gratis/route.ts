// app/api/lp3h/sertifikasi-gratis/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await requireRole('lp3h');

    const lp3h = await prisma.lp3hProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!lp3h) {
      return NextResponse.json({ error: 'Profil LP3H tidak ditemukan' }, { status: 404 });
    }

    const submissions = await prisma.sertifikasiGratisSubmission.findMany({
      // lp3hId bisa keisi lebih awal (begitu UMKM pilih Pendamping pas
      // submit), SEBELUM Admin resmi menugaskan. LP3H cuma boleh lihat
      // yang statusnya sudah PASTI ditugaskan/selesai - kalau masih
      // "menunggu_verifikasi", itu masih preferensi UMKM doang, belum
      // jadi tugas resmi buat lembaga ini
      where: { lp3hId: lp3h.id, status: { in: ['ditugaskan', 'selesai'] } },
      orderBy: { createdAt: 'desc' },
      include: {
        umkm: {
          select: {
            businessName: true,
            ownerName: true,
            businessContactNumber: true,
            establishedYear: true,
            businessKecamatan: true,
            businessKabupaten: true,
            businessAddress: true,
            businessType: true,
            nibNumber: true,
            businessCategory: { select: { name: true } },
          },
        },
        products: { include: { product: { select: { id: true, name: true, photoUrl: true, price: true, halalStatus: true, category: { select: { name: true } } } } } },
        pendamping: { select: { name: true, phone: true } },
        fasilitasiCode: { select: { code: true } },
      },
    });

    return NextResponse.json({ data: submissions });
  } catch (error) {
    console.error('Get lp3h sertifikasi-gratis list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
