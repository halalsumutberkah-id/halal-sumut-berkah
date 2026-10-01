import { z } from 'zod';

export const EDUCATION_CATEGORIES = [
  // Objek Produk dan Jasa
  { value: 'produk_makanan', label: 'Makanan', group: 'Objek Produk & Jasa' },
  { value: 'produk_minuman', label: 'Minuman', group: 'Objek Produk & Jasa' },
  { value: 'produk_kosmetik', label: 'Obat & Kosmetik', group: 'Objek Produk & Jasa' },
  { value: 'barang_gunaan', label: 'Barang Gunaan & Jasa', group: 'Objek Produk & Jasa' },

  // Kompetensi & Profesi (Aktor Layanan)
  { value: 'regulasi_bpjph', label: 'Regulasi & BPJPH', group: 'Kompetensi & Aktor Layanan' },
  { value: 'lph', label: 'Lembaga Pemeriksa Halal (LPH)', group: 'Kompetensi & Aktor Layanan' },
  { value: 'lp3h', label: 'Lembaga Pendamping PPH (LP3H)', group: 'Kompetensi & Aktor Layanan' },
  { value: 'pendamping_p3h', label: 'Pendamping Halal (P3H)', group: 'Kompetensi & Aktor Layanan' },
  { value: 'penyelia_halal', label: 'Penyelia Halal', group: 'Kompetensi & Aktor Layanan' },
] as const;

export const contentSchema = z.object({
  title: z.string().min(5, 'Judul minimal 5 karakter'),
  thumbnail: z.string().url().optional().or(z.literal('')),
  content: z.string().refine((val) => val.trim() !== '' && val !== '<p></p>', {
    message: 'Konten tidak boleh kosong',
  }),
  isPublished: z.boolean().default(false),
});

export type ContentInput = z.infer<typeof contentSchema>;

export const educationContentSchema = contentSchema.extend({
  category: z.string().min(1, 'Kategori wajib dipilih'),
});

export type EducationContentInput = z.infer<typeof educationContentSchema>;
