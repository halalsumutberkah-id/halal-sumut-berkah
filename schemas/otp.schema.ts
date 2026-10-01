import { z } from 'zod';

export const verifyOtpSchema = z.object({
  email: z.string().email('Email tidak valid'),
  otp: z.string().length(6, 'Kode OTP harus 6 digit'),
});

export const resendOtpSchema = z.object({
  email: z.string().email('Email tidak valid'),
});
