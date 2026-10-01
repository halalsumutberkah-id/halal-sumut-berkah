import { describe, it, expect } from 'vitest';
import { verifyOtpSchema, resendOtpSchema } from '@/schemas/otp.schema';

describe('verifyOtpSchema', () => {
  it('lolos kalau email valid dan otp 6 digit', () => {
    const result = verifyOtpSchema.safeParse({
      email: 'umkm@example.com',
      otp: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('gagal kalau otp kurang dari 6 digit', () => {
    const result = verifyOtpSchema.safeParse({
      email: 'umkm@example.com',
      otp: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau otp lebih dari 6 digit', () => {
    const result = verifyOtpSchema.safeParse({
      email: 'umkm@example.com',
      otp: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('gagal kalau email tidak valid', () => {
    const result = verifyOtpSchema.safeParse({
      email: 'bukan-email',
      otp: '123456',
    });
    expect(result.success).toBe(false);
  });
});

describe('resendOtpSchema', () => {
  it('lolos kalau email valid', () => {
    expect(resendOtpSchema.safeParse({ email: 'umkm@example.com' }).success).toBe(true);
  });

  it('gagal kalau email tidak valid', () => {
    expect(resendOtpSchema.safeParse({ email: 'bukan-email' }).success).toBe(false);
  });
});
