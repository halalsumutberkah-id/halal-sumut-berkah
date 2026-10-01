import { describe, it, expect } from 'vitest';
import { productSchema } from '@/schemas/product.schema';

const validProduct = {
  name: 'Keripik Singkong',
  price: 15000,
  categoryId: 'cat-123',
  images: ['https://res.cloudinary.com/demo/image/upload/produk.jpg'],
};

describe('productSchema', () => {
  it('lolos kalau semua field valid', () => {
    const result = productSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('gagal kalau nama produk kurang dari 3 karakter', () => {
    const result = productSchema.safeParse({ ...validProduct, name: 'ab' });
    expect(result.success).toBe(false);
  });

  it('gagal kalau harga 0 atau negatif', () => {
    expect(productSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false);
    expect(productSchema.safeParse({ ...validProduct, price: -5000 }).success).toBe(false);
  });

  it('gagal kalau harga bukan bilangan bulat (ada desimal)', () => {
    const result = productSchema.safeParse({ ...validProduct, price: 15000.5 });
    expect(result.success).toBe(false);
  });

  it('gagal kalau categoryId kosong', () => {
    const result = productSchema.safeParse({ ...validProduct, categoryId: '' });
    expect(result.success).toBe(false);
  });

  it('gagal kalau tidak ada gambar sama sekali', () => {
    const result = productSchema.safeParse({ ...validProduct, images: [] });
    expect(result.success).toBe(false);
  });

  it('gagal kalau gambar lebih dari 3', () => {
    const result = productSchema.safeParse({
      ...validProduct,
      images: ['https://res.cloudinary.com/demo/1.jpg', 'https://res.cloudinary.com/demo/2.jpg', 'https://res.cloudinary.com/demo/3.jpg', 'https://res.cloudinary.com/demo/4.jpg'],
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau gambar bukan URL valid', () => {
    const result = productSchema.safeParse({ ...validProduct, images: ['bukan-url'] });
    expect(result.success).toBe(false);
  });

  it('lolos tanpa deskripsi (opsional)', () => {
    const { description, ...withoutDescription } = { ...validProduct, description: undefined };
    const result = productSchema.safeParse(withoutDescription);
    expect(result.success).toBe(true);
  });
});
