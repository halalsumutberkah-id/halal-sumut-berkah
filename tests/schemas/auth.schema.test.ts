import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/schemas/auth.schema';

describe('loginSchema', () => {
  it('lolos kalau email dan password valid', () => {
    const result = loginSchema.safeParse({
      email: 'umkm@example.com',
      password: 'rahasia123',
    });
    expect(result.success).toBe(true);
  });

  it('gagal kalau email tidak valid formatnya', () => {
    const result = loginSchema.safeParse({
      email: 'bukan-email',
      password: 'rahasia123',
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau password kurang dari 6 karakter', () => {
    const result = loginSchema.safeParse({
      email: 'umkm@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau email kosong', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: 'rahasia123',
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau field password tidak dikirim sama sekali', () => {
    const result = loginSchema.safeParse({ email: 'umkm@example.com' });
    expect(result.success).toBe(false);
  });
});
