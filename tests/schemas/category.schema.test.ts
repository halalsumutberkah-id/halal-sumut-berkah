import { describe, it, expect } from 'vitest';
import { categorySchema } from '@/schemas/category.schema';

describe('categorySchema', () => {
  it('lolos kalau nama kategori valid', () => {
    expect(categorySchema.safeParse({ name: 'Makanan Ringan' }).success).toBe(true);
  });

  it('gagal kalau nama kategori kurang dari 2 karakter', () => {
    expect(categorySchema.safeParse({ name: 'a' }).success).toBe(false);
  });

  it('gagal kalau nama kategori kosong', () => {
    expect(categorySchema.safeParse({ name: '' }).success).toBe(false);
  });
});
