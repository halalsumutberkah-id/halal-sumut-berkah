// schemas/daftar-mandiri.schema.ts

import { z } from 'zod';

export const daftarMandiriSchema = z.object({
  productId: z.string().min(1, 'Produk wajib dipilih'),
  lp3hId: z.string().min(1, 'LP3H wajib dipilih'),
  pendampingId: z.string().min(1, 'Pendamping wajib dipilih'),

  // 5 pertanyaan eligibilitas Daftar Mandiri - dicatat apa adanya (jujur),
  // tidak dipaksa harus semua "true" di level validasi. Kalau ada yang
  // dijawab tidak memenuhi, itu jadi bahan pertimbangan LP3H/Admin pas
  // meninjau, bukan otomatis diblokir sistem
  isLowRisk: z.boolean(),
  usesHalalIngredients: z.boolean(),
  simpleCleanProduction: z.boolean(),
  simpleEquipment: z.boolean(),
  simplePreservation: z.boolean(),

  agreedToTerms: z.literal(true, {
    message: 'Anda wajib menyetujui pernyataan sebelum mengajukan',
  }),
});

export type DaftarMandiriInput = z.infer<typeof daftarMandiriSchema>;

export const DAFTAR_MANDIRI_STATUSES = ['belum_diproses', 'sedang_diproses', 'selesai', 'ditolak'] as const;

export const updateDaftarMandiriStatusSchema = z.object({
  status: z.enum(DAFTAR_MANDIRI_STATUSES, { message: 'Status tidak valid' }),
  adminNote: z.string().optional().or(z.literal('')),
  // opsional - kalau Admin sekalian isi sertifikat halal resmi pas
  // menandai pengajuan "selesai", produk terkait otomatis diupdate
  halalCertNumber: z.string().optional().or(z.literal('')),
  halalCertUrl: z.string().url().optional().or(z.literal('')),
});
