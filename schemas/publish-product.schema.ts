// schemas/publish-product.schema.ts

import { z } from 'zod';

export const publishProductSchema = z.object({
  lp3hId: z.string().optional().or(z.literal('')),
  agreedResponsibility: z.literal(true, {
    message: 'Anda wajib menyetujui pernyataan tanggung jawab',
  }),
  agreedPublicationConsent: z.literal(true, {
    message: 'Anda wajib menyetujui izin publikasi',
  }),
});

export type PublishProductInput = z.infer<typeof publishProductSchema>;
