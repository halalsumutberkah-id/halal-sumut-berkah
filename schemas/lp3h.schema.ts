// schemas/lp3h.schema.ts

import { z } from 'zod';

// 10-13 digit, wajib diawali "08" - format sama persis kayak nomor
// WhatsApp yang dipakai di form lain (UMKM, dst)
export const LP3H_PHONE_REGEX = /^08\d{8,11}$/;

export const createLp3hSchema = z.object({
  name: z.string().min(3, 'Nama LP3H minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  address: z.string().min(15, 'Detail alamat minimal 15 karakter'),
  phone: z.string().regex(LP3H_PHONE_REGEX, 'Nomor telepon tidak valid, harus 10-13 digit diawali 08'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export type CreateLp3hInput = z.infer<typeof createLp3hSchema>;

export const updateLp3hSchema = z.object({
  name: z.string().min(3, 'Nama LP3H minimal 3 karakter'),
  address: z.string().min(15, 'Detail alamat minimal 15 karakter'),
  phone: z.string().regex(LP3H_PHONE_REGEX, 'Nomor telepon tidak valid, harus 10-13 digit diawali 08'),
  description: z.string().optional(),
  logoUrl: z.string().url().optional(),
});

export type UpdateLp3hInput = z.infer<typeof updateLp3hSchema>;
