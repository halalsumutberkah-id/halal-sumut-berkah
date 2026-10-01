import { describe, it, expect } from 'vitest';
import { forgotPasswordSchema, resetPasswordSchema } from '@/schemas/reset-password.schema';

describe('forgotPasswordSchema', () => {
  it('lolos kalau email valid', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'umkm@example.com' }).success).toBe(true);
  });

  it('gagal kalau email tidak valid', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'bukan-email' }).success).toBe(false);
  });
});

describe('resetPasswordSchema', () => {
  const validPayload = {
    token: 'a1b2c3d4',
    password: 'passwordbaru123',
    confirmPassword: 'passwordbaru123',
  };

  it('lolos kalau semua field valid dan password cocok', () => {
    expect(resetPasswordSchema.safeParse(validPayload).success).toBe(true);
  });

  it('gagal kalau token kosong', () => {
    const result = resetPasswordSchema.safeParse({ ...validPayload, token: '' });
    expect(result.success).toBe(false);
  });

  it('gagal kalau password kurang dari 6 karakter', () => {
    const result = resetPasswordSchema.safeParse({
      ...validPayload,
      password: '123',
      confirmPassword: '123',
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau confirmPassword tidak cocok sama password', () => {
    const result = resetPasswordSchema.safeParse({
      ...validPayload,
      confirmPassword: 'beda-password',
    });
    expect(result.success).toBe(false);

    // pastikan error-nya nempel di field confirmPassword yang benar
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });
});
