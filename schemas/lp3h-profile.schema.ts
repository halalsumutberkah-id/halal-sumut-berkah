// schemas/lp3h-profile.schema.ts

import { z } from 'zod';
import { LP3H_PHONE_REGEX } from '@/schemas/lp3h.schema';

// NIK selalu 16 digit angka (standar nasional) - sama pola validasi yang
// dipakai di pendampingSchema
const NIK_REGEX = /^\d{16}$/;

// dipakai LP3H sendiri MAUPUN Admin - termasuk field legalitas
// (registrationDocumentUrl). LP3H sekarang bisa isi/ubah sendiri
// legalitasnya, Admin tetap bisa override lewat endpoint yang sama ATAU
// lewat /api/admin/lp3h/[id]/legality (updateLp3hLegalitySchema di bawah,
// dipertahankan sebagai jalur override terpisah)
export const updateLp3hProfileSchema = z.object({
  name: z.string().min(3, 'Nama lembaga minimal 3 karakter'),
  jenisLembaga: z.string().min(2, 'Jenis lembaga wajib diisi'),
  lembagaInduk: z.string().min(2, 'Lembaga induk wajib diisi'),
  officeKecamatan: z.string().min(1, 'Kecamatan wajib dipilih'),
  officeKabupaten: z.string().min(1, 'Kabupaten/kota wajib dipilih'),
  officeAddress: z.string().min(15, 'Detail alamat minimal 15 karakter'),
  phone: z.string().regex(LP3H_PHONE_REGEX, 'Nomor telepon tidak valid, harus 10-13 digit diawali 08'),
  contactEmail: z.string().email('Email tidak valid'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().optional().or(z.literal('')),

  // Data Penanggung Jawab/Admin LP3H - WAJIB dilengkapi
  pjName: z.string().min(3, 'Nama lengkap penanggung jawab minimal 3 karakter'),
  pjNik: z.string().regex(NIK_REGEX, 'NIK penanggung jawab harus 16 digit angka'),
  pjEmail: z.string().email('Email penanggung jawab tidak valid'),
  pjJabatan: z.string().min(2, 'Jabatan penanggung jawab wajib diisi'),
  pjJenisKelamin: z.enum(['L', 'P'], { message: 'Jenis kelamin tidak valid' }),
  pjPhone: z.string().regex(LP3H_PHONE_REGEX, 'Nomor WhatsApp tidak valid, harus 10-13 digit diawali 08'),
  pjKtpUrl: z.string().url('KTP penanggung jawab wajib diunggah'),

  // Legalitas - screenshot bukti registrasi SIHALAL. Awalnya khusus
  // Admin (endpoint /api/admin/lp3h/[id]/legality terpisah), sekarang
  // LP3H JUGA bisa isi/ubah sendiri lewat profil mereka
  registrationDocumentUrl: z.string().url('Screenshot bukti registrasi SIHALAL wajib diunggah'),
});

export type UpdateLp3hProfileInput = z.infer<typeof updateLp3hProfileSchema>;

// Jalur override KHUSUS Admin buat legalitas lembaga, dipakai di endpoint
// terpisah (/api/admin/lp3h/[id]/legality). Field-nya sama persis
// (registrationDocumentUrl) dengan yang ada di updateLp3hProfileSchema -
// LP3H bisa isi lewat profil mereka sendiri, Admin bisa override lewat
// endpoint ini kalau perlu, dua-duanya nulis ke kolom yang sama.
//
// registrationDocumentUrl berupa SCREENSHOT (jpg/png/jpeg) bukti nomor
// registrasi SIHALAL - bukan lagi input angka + dokumen PDF terpisah.
// Nomor SK & dokumen SK dihapus total dari legalitas.
export const updateLp3hLegalitySchema = z.object({
  registrationDocumentUrl: z.string().url('Screenshot bukti registrasi SIHALAL wajib diunggah'),
});

export type UpdateLp3hLegalityInput = z.infer<typeof updateLp3hLegalitySchema>;
