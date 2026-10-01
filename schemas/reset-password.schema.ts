import { z } from 'zod';

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email tidak valid'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token tidak valid'),
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmPassword'],
  });
