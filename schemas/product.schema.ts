// schemas/product.schema.ts

import { z } from 'zod';

// Format resmi nomor sertifikat halal: kode "ID" + 17 digit angka = 19 karakter
export const HALAL_CERT_NUMBER_REGEX = /^ID\d{17}$/;
export const HALAL_CERT_NUMBER_MESSAGE = 'Nomor sertifikat halal harus 19 karakter: diawali huruf ID lalu 17 digit angka (contoh: ID00110000012345678)';

export const productSchema = z.object({
  name: z.string().min(3, 'Nama produk minimal 3 karakter'),
  price: z.number().int().positive('Harga harus lebih dari 0'),
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  shortDescription: z.string().refine((val) => val.trim().split(/\s+/).filter(Boolean).length >= 10, {
    message: 'Deskripsi singkat minimal 10 kata',
  }),
  photoUrl: z.string().url('Foto produk wajib diunggah'),

  halalCertNumber: z
    .string()
    .optional()
    .or(z.literal(''))
    .refine((val) => !val || HALAL_CERT_NUMBER_REGEX.test(val), {
      message: HALAL_CERT_NUMBER_MESSAGE,
    }),
  halalCertUrl: z.string().url().optional().or(z.literal('')),

  // izin tambahan - nomor PIRT/BPOM/HAKI TANPA validasi format karena
  // formatnya bervariasi tergantung jenis produk. Data ini ditampilkan
  // di profil publik apa adanya.
  pirtNumber: z.string().optional().or(z.literal('')),
  bpomNumber: z.string().optional().or(z.literal('')),
  hakiNumber: z.string().optional().or(z.literal('')),
});

export type ProductInput = z.infer<typeof productSchema>;
