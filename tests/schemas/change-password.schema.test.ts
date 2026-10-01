import { describe, it, expect } from 'vitest';
import { changePasswordSchema } from '@/schemas/change-password.schema';

describe('changePasswordSchema', () => {
  it('lolos kalau password lama & baru valid', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'lamaBanget123',
      newPassword: 'barudongsekarang',
    });
    expect(result.success).toBe(true);
  });

  it('gagal kalau password lama kosong', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'barudongsekarang',
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau password baru kurang dari 6 karakter', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'lamaBanget123',
      newPassword: '123',
    });
    expect(result.success).toBe(false);
  });
});
