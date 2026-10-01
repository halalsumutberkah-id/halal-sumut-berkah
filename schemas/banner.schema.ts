// schemas/banner.schema.ts

import { z } from 'zod';

export const bannerSchema = z.object({
  imageUrl: z.string().url('Gambar wajib diunggah'),
  link: z.string().url('Link tidak valid').optional().or(z.literal('')),
  sequence: z.number().int().min(0, 'Urutan tidak boleh negatif'),
  isActive: z.boolean(),
});

export type BannerInput = z.infer<typeof bannerSchema>;
