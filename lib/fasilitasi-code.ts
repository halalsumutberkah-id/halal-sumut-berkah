// lib/fasilitasi-code.ts

import { prisma } from '@/lib/prisma';

// Cari Kode Fasilitasi aktif yang kuotanya masih tersisa, urut dari
// yang paling lama dibuat - implementasi "100 UMKM pertama pakai Kode A,
// 300 berikutnya Kode B": begitu kuota Kode A penuh, otomatis pindah ke
// kode aktif berikutnya. Return null kalau semua kode penuh/tidak ada
// kode aktif sama sekali - submission TETAP boleh dibuat tanpa kode,
// Admin bisa assign manual belakangan kalau ada kode baru.
export async function findAvailableFasilitasiCodeId(): Promise<string | null> {
  const activeCodes = await prisma.fasilitasiCode.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { id: true, quota: true },
  });

  for (const code of activeCodes) {
    const usedCount = await prisma.sertifikasiGratisSubmission.count({ where: { fasilitasiCodeId: code.id } });
    if (usedCount < code.quota) return code.id;
  }

  return null;
}
