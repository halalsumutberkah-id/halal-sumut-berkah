// schemas/register-form.schema.ts

import { z } from 'zod';
import { registerObjectSchema } from '@/schemas/register.schema';

// versi client - field dokumen (ktpUrl/logoUrl/nibUrl) dibuang karena di form
// itu masih berupa File, belum jadi URL (baru diupload pas submit), dan
// tambah confirmPassword buat validasi form
export const registerFormObjectSchema = registerObjectSchema
  .omit({
    ktpUrl: true,
    logoUrl: true,
    nibUrl: true,
  })
  .extend({
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  });

export const registerFormSchema = registerFormObjectSchema
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  })
  .refine((data) => data.businessCategoryId !== 'lainnya' || (!!data.customBusinessCategory && data.customBusinessCategory.trim().length >= 2), { message: 'Nama kategori usaha wajib diisi', path: ['customBusinessCategory'] });
