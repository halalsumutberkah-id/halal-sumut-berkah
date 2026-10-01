// schemas/pendamping.schema.ts

import { z } from 'zod';

export const pendampingSchema = z.object({
  name: z.string().min(3, 'Nama lengkap minimal 3 karakter'),
  phone: z.string().regex(/^08\d{8,11}$/, 'Nomor HP tidak valid, contoh: 081234567890'),
  photoUrl: z.string().url().optional().or(z.literal('')),

  // data pribadi - tetap opsional (bisa dilengkapi belakangan)
  nikP3h: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus berupa angka').optional().or(z.literal('')),
  jenisKelamin: z.enum(['L', 'P'], { message: 'Jenis kelamin tidak valid' }).optional(),
  emailP3h: z.string().email('Email tidak valid').optional().or(z.literal('')),
  kecamatan: z.string().optional().or(z.literal('')),
  kabupaten: z.string().optional().or(z.literal('')),
  alamatDetail: z.string().optional().or(z.literal('')),
  ktpUrl: z.string().url().optional().or(z.literal('')),

  // legalitas P3H - WAJIB diisi semua, ini yang bakal diverifikasi Admin.
  // Nomor registrasi & SK tidak lagi diinput manual:
  // - bukti registrasi = screenshot nomor registrasi dari SIHALAL (gambar)
  // - SK diganti sertifikat pelatihan P3H
  registrasiSihalalUrl: z.string().url('Bukti screenshot registrasi SIHALAL wajib diunggah'),
  registrasiBpjphUrl: z.string().url('Dokumen registrasi BPJPH wajib diunggah'),
  sertifikatPelatihanUrl: z.string().url('Sertifikat pelatihan P3H wajib diunggah'),
});

export type PendampingInput = z.infer<typeof pendampingSchema>;
