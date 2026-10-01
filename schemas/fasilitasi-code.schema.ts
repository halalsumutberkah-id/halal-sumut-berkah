// schemas/fasilitasi-code.schema.ts

import { z } from 'zod';

// Kode Fasilitasi - kode referensi eksternal (dipakai manual oleh
// Pendamping di portal SIHALAL/BPJPH, TIDAK divalidasi sistem kita).
// Admin input kode + kuota secara bertahap.
export const createFasilitasiCodeSchema = z.object({
  code: z
    .string()
    .min(1, 'Kode wajib diisi')
    .max(50, 'Kode maksimal 50 karakter')
    .regex(/^[A-Za-z0-9\-_./]+$/, 'Kode hanya boleh huruf, angka, dan tanda - _ . /'),
  quota: z.number().int().positive('Kuota harus lebih dari 0'),
  isActive: z.boolean(),
});

export type CreateFasilitasiCodeInput = z.infer<typeof createFasilitasiCodeSchema>;

export const updateFasilitasiCodeSchema = createFasilitasiCodeSchema;

export type UpdateFasilitasiCodeInput = z.infer<typeof updateFasilitasiCodeSchema>;
