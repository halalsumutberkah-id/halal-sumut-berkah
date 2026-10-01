// schemas/bulk-product.schema.ts

import { z } from 'zod';
import { productSchema } from '@/schemas/product.schema';

// tiap baris produk pakai field yang SAMA kayak form tambah produk biasa,
// TAPI tanpa categoryId/halalCertNumber/halalCertUrl - 3 field itu di-share
// di level atas (1x isi buat semua produk dalam grup)
const bulkProductItemSchema = productSchema.omit({
  categoryId: true,
  halalCertNumber: true,
  halalCertUrl: true,
});

export const bulkProductSchema = z.object({
  // field yang di-share ke semua produk dalam grup
  categoryId: z.string().min(1, 'Kategori wajib dipilih'),
  halalCertNumber: productSchema.shape.halalCertNumber,
  halalCertUrl: productSchema.shape.halalCertUrl,

  // minimal 2 produk - kalau cuma 1, pakai form tambah produk biasa aja
  products: z.array(bulkProductItemSchema).min(2, 'Minimal 2 produk untuk mode tambah grup, kalau cuma 1 pakai form Tambah Produk biasa'),
});

export type BulkProductInput = z.infer<typeof bulkProductSchema>;
