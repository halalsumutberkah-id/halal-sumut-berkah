// schemas/umkm-profile.schema.ts

import { z } from 'zod';
import { BUSINESS_TYPES } from '@/schemas/register.schema';

export const updateUmkmProfileSchema = z.object({
  // data pelaku usaha
  ownerName: z.string().min(3, 'Nama pelaku usaha minimal 3 karakter'),
  ownerNik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  ownerPhone: z.string().regex(/^08\d{8,11}$/, 'Nomor WhatsApp tidak valid'),
  ownerKecamatan: z.string().min(3, 'Kecamatan wajib diisi'),
  ownerKabupaten: z.string().min(1, 'Kabupaten/kota wajib dipilih'),
  ownerAddress: z.string().min(5, 'Alamat detail minimal 5 karakter'),
  ktpUrl: z.string().url('KTP wajib diunggah'),

  // data usaha
  businessName: z.string().min(3, 'Nama usaha minimal 3 karakter'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  nibNumber: z.string().min(5, 'Nomor NIB minimal 5 karakter'),
  nibUrl: z.string().url('NIB wajib diunggah'),
  establishedYear: z.number().int().min(1900, 'Tahun berdiri tidak valid').max(new Date().getFullYear(), 'Tahun berdiri tidak valid'),
  businessKecamatan: z.string().min(3, 'Kecamatan wajib diisi'),
  businessKabupaten: z.string().min(1, 'Kabupaten/kota wajib dipilih'),
  businessAddress: z.string().min(5, 'Alamat detail minimal 5 karakter'),
  businessType: z.enum(BUSINESS_TYPES, { message: 'Bentuk usaha wajib dipilih' }),
  businessCategoryId: z.string().min(1, 'Kategori usaha wajib dipilih'),
  annualRevenue: z.string().min(1, 'Nilai omset per tahun wajib diisi'),
  businessContactNumber: z.string().regex(/^08\d{8,11}$/, 'Nomor kontak usaha tidak valid, contoh: 081234567890'),
});

export type UpdateUmkmProfileInput = z.infer<typeof updateUmkmProfileSchema>;
