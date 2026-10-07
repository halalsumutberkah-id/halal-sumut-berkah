import { z } from 'zod';

export const lphEntitySchema = z.object({
  name: z.string().min(3, 'Nama LPH minimal 3 karakter'),
  address: z.string().min(10, 'Alamat terlalu pendek'),
  kabupaten: z.string().min(1, 'Kabupaten/kota wajib dipilih'),
  phone: z.string().min(9, 'Nomor telepon tidak valid'),
  email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  contactWhatsapp: z.string().regex(/^08\d{8,11}$/, 'Nomor WA tidak valid, contoh: 081234567890'),
  registrationNumberBpjph: z.string().min(1, 'No. Registrasi BPJPH wajib diisi'),
  skValidUntil: z.string().min(1, 'Masa berlaku SK wajib diisi'),
  inspectionScope: z.string().min(3, 'Lingkup pemeriksaan wajib diisi'),
  description: z.string().optional().or(z.literal('')),
});

export type LphEntityInput = z.infer<typeof lphEntitySchema>;
