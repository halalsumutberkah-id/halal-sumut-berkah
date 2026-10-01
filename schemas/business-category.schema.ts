import { z } from 'zod';

export const businessCategorySchema = z.object({
  name: z.string().min(2, 'Nama kategori minimal 2 karakter'),
});

export type BusinessCategoryInput = z.infer<typeof businessCategorySchema>;
