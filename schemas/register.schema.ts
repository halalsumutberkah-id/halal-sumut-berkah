// schemas/register.schema.ts

import { z } from 'zod';

export const BUSINESS_TYPES = ['cv', 'pt', 'koperasi', 'perorangan', 'lainnya'] as const;

// kombinasi: minimal 8 karakter, huruf besar, huruf kecil, angka, simbol
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const registerObjectSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter').regex(PASSWORD_REGEX, 'Password harus kombinasi huruf besar, huruf kecil, angka, dan simbol'),

  // data pelaku usaha
  ownerName: z.string().min(3, 'Nama pelaku usaha minimal 3 karakter'),
  ownerNik: z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'NIK harus berupa angka'),
  ownerGender: z.enum(['L', 'P'], { message: 'Jenis kelamin wajib dipilih' }),
  birthDate: z.string().min(1, 'Tanggal lahir wajib diisi'),
  ownerPhone: z.string().regex(/^08\d{8,11}$/, 'Nomor WhatsApp tidak valid, contoh: 081234567890'),
  ownerKecamatan: z.string().min(3, 'Kecamatan wajib diisi'),
  ownerKabupaten: z.string().min(1, 'Kabupaten/kota wajib dipilih'),
  ownerAddress: z.string().min(5, 'Alamat detail minimal 5 karakter'),
  ktpUrl: z.string().url('KTP wajib diunggah'),

  // data usaha
  businessName: z.string().min(3, 'Nama usaha minimal 3 karakter'),
  logoUrl: z.string().url().optional().or(z.literal('')),
  nibNumber: z.string().length(13, 'Nomor NIB harus 13 digit').regex(/^\d+$/, 'Nomor NIB harus berupa angka'),
  nibUrl: z.string().url('NIB wajib diunggah'),
  establishedYear: z.number().int().min(1900, 'Tahun berdiri tidak valid').max(new Date().getFullYear(), 'Tahun berdiri tidak valid'),
  businessKecamatan: z.string().min(3, 'Kecamatan wajib diisi'),
  businessKabupaten: z.string().min(1, 'Kabupaten/kota wajib dipilih'),
  businessAddress: z.string().min(5, 'Alamat detail minimal 5 karakter'),
  businessType: z.enum(BUSINESS_TYPES, { message: 'Bentuk usaha wajib dipilih' }),
  businessCategoryId: z.string().min(1, 'Kategori usaha wajib dipilih'),
  // diisi kalau businessCategoryId = "lainnya" - kategori custom yang
  // diketik sendiri sama pelaku usaha
  customBusinessCategory: z.string().optional().or(z.literal('')),
  // disimpan sebagai angka murni (tanpa "Rp"/titik) - format tampilan
  // "Rp x.xxx.xxx" itu urusan UI doang, bukan yang disimpan
  annualRevenue: z.string().min(1, 'Nilai omset per tahun wajib diisi').regex(/^\d+$/, 'Nilai omset harus berupa angka'),
  businessContactNumber: z.string().regex(/^08\d{8,11}$/, 'Nomor kontak usaha tidak valid, contoh: 081234567890'),
});

const businessCategoryRefine = (data: { businessCategoryId: string; customBusinessCategory?: string }) => data.businessCategoryId !== 'lainnya' || (!!data.customBusinessCategory && data.customBusinessCategory.trim().length >= 2);

export const registerSchema = registerObjectSchema.refine(businessCategoryRefine, {
  message: 'Nama kategori usaha wajib diisi',
  path: ['customBusinessCategory'],
});

export type RegisterInput = z.infer<typeof registerSchema>;
