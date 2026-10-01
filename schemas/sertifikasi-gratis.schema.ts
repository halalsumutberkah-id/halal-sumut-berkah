// schemas/sertifikasi-gratis.schema.ts

import { z } from 'zod';

// UMKM ajuin - pilih beberapa produk sekaligus, Pendamping opsional
// (boleh dipilih sendiri LANGSUNG tanpa pilih LP3H dulu, atau
// dikosongkan - nanti ditentukan Admin). lp3hId di submission di-derive
// otomatis dari pendamping yang dipilih (lihat route handler)
export const createSertifikasiGratisSchema = z.object({
  productIds: z.array(z.string()).min(1, 'Pilih minimal 1 produk'),
  pendampingId: z.string().min(1).optional().nullable(),
});

export type CreateSertifikasiGratisInput = z.infer<typeof createSertifikasiGratisSchema>;

// Admin verifikasi - approve (wajib Pendamping - TAPI kalau UMKM sudah
// pilih Pendamping sendiri pas submit, Admin CUKUP approve tanpa isi
// ulang; field ini cuma dipakai kalau Admin mau assign/override manual)
// ATAU reject (wajib catatan). lp3hId TIDAK PERNAH diminta dari Admin -
// selalu di-derive otomatis dari pendamping.lp3hId di route handler.
export const verifySertifikasiGratisSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('ditugaskan'),
    pendampingId: z.string().min(1).optional(),
  }),
  z.object({
    status: z.literal('ditolak'),
    adminNote: z.string().min(1, 'Catatan wajib diisi kalau menolak'),
  }),
]);

export type VerifySertifikasiGratisInput = z.infer<typeof verifySertifikasiGratisSchema>;

export const updateAssignmentSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('reassign'),
    pendampingId: z.string().min(1, 'Pendamping wajib dipilih'),
  }),
  z.object({
    action: z.literal('cancel'),
  }),
]);

export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;

// Admin tandain selesai + isi sertifikat halal - berlaku buat SEMUA
// produk dalam pengajuan ini sekaligus
export const completeSertifikasiGratisSchema = z.object({
  halalCertNumber: z
    .string()
    .min(1, 'Nomor sertifikat halal wajib diisi')
    .refine((val) => /^ID\d{17}$/.test(val), {
      message: 'Nomor sertifikat halal harus 19 karakter: diawali huruf ID lalu 17 digit angka (contoh: ID00110000012345678)',
    }),
  halalCertUrl: z.string().url('Dokumen sertifikat halal wajib diunggah'),
});

export type CompleteSertifikasiGratisInput = z.infer<typeof completeSertifikasiGratisSchema>;
