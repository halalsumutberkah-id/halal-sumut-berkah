// lib/get-admin-ids.ts

import { prisma } from '@/lib/prisma';

// daftar id super_admin jarang berubah (nambah admin baru itu operasi
// langka), jadi di-cache in-memory dengan TTL - skip query DB kalau
// masih fresh. Dipakai di banyak endpoint yang kirim notifikasi ke semua
// admin tiap ada submission baru
const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedIds: string[] | null = null;
let cachedAt = 0;

export async function getAdminIds(): Promise<string[]> {
  const now = Date.now();

  if (cachedIds && now - cachedAt < CACHE_TTL_MS) {
    return cachedIds;
  }

  const admins = await prisma.user.findMany({
    where: { role: 'super_admin' },
    select: { id: true },
  });

  cachedIds = admins.map((a) => a.id);
  cachedAt = now;

  return cachedIds;
}