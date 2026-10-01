// app/api/umkm/sertifikasi-gratis/eligible-products/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';

const ACTIVE_DAFTAR_MANDIRI = ['belum_diproses', 'sedang_diproses'];
const ACTIVE_SERTIFIKASI_GRATIS = ['menunggu_verifikasi', 'ditugaskan'];

// produk yang boleh dipilih buat diajukan Sertifikasi Gratis - belum
// halal, dan tidak lagi ada pengajuan aktif di Daftar Mandiri LAMA maupun
// Sertifikasi Gratis ini
export async function GET() {
  try {
    const user = await requireRole('umkm');

    const umkm = await prisma.umkmProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { umkmId: umkm.id, halalStatus: { not: 'halal' } },
      include: {
        daftarMandiriSubmissions: { select: { status: true } },
        sertifikasiGratisProducts: { include: { submission: { select: { status: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const eligible = products.filter((product) => {
      const hasActiveDaftarMandiri = product.daftarMandiriSubmissions.some((s) => ACTIVE_DAFTAR_MANDIRI.includes(s.status));
      const hasActiveSertifikasiGratis = product.sertifikasiGratisProducts.some((sp) => ACTIVE_SERTIFIKASI_GRATIS.includes(sp.submission.status));
      return !hasActiveDaftarMandiri && !hasActiveSertifikasiGratis;
    });

    return NextResponse.json({
      data: eligible.map((p) => ({ id: p.id, name: p.name, photoUrl: p.photoUrl })),
    });
  } catch (error) {
    console.error('Get eligible products error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
