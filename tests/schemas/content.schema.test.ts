import { describe, it, expect } from 'vitest';
import { contentSchema } from '@/schemas/content.schema';

const validPayload = {
  title: 'Panduan Sertifikasi Halal',
  content: '<p>Ini konten artikel.</p>',
  isPublished: false,
};

describe('contentSchema', () => {
  it('lolos kalau title dan content valid', () => {
    expect(contentSchema.safeParse(validPayload).success).toBe(true);
  });

  it('gagal kalau title kurang dari 5 karakter', () => {
    const result = contentSchema.safeParse({ ...validPayload, title: 'abc' });
    expect(result.success).toBe(false);
  });

  it('lolos kalau content pendek asal tidak kosong (tidak ada aturan minimal panjang)', () => {
    const result = contentSchema.safeParse({ ...validPayload, content: '<p>Pendek.</p>' });
    expect(result.success).toBe(true);
  });

  it('gagal kalau content string kosong', () => {
    const result = contentSchema.safeParse({ ...validPayload, content: '' });
    expect(result.success).toBe(false);
  });

  it("gagal kalau content cuma '<p></p>' (artefak editor Tiptap kosong)", () => {
    const result = contentSchema.safeParse({ ...validPayload, content: '<p></p>' });
    expect(result.success).toBe(false);
  });

  it('gagal kalau content cuma spasi doang', () => {
    const result = contentSchema.safeParse({ ...validPayload, content: '   ' });
    expect(result.success).toBe(false);
  });

  it('lolos kalau thumbnail berupa URL valid', () => {
    const result = contentSchema.safeParse({
      ...validPayload,
      thumbnail: 'https://res.cloudinary.com/demo/thumbnail.jpg',
    });
    expect(result.success).toBe(true);
  });

  it('lolos kalau field thumbnail tidak dikirim sama sekali (opsional)', () => {
    expect(contentSchema.safeParse(validPayload).success).toBe(true);
  });

  it("lolos kalau thumbnail string kosong (dianggap 'tidak ada gambar')", () => {
    const result = contentSchema.safeParse({ ...validPayload, thumbnail: '' });
    expect(result.success).toBe(true);
  });

  it('gagal kalau thumbnail diisi tapi bukan URL valid dan bukan string kosong', () => {
    const result = contentSchema.safeParse({ ...validPayload, thumbnail: 'bukan-url' });
    expect(result.success).toBe(false);
  });
});
