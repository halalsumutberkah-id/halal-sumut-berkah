// schemas/change-password-form.schema.ts

import { z } from 'zod';

export const changePasswordFormObjectSchema = z.object({
  currentPassword: z.string().min(1, 'Password lama wajib diisi'),
  newPassword: z.string().min(6, 'Password baru minimal 6 karakter'),
  confirmNewPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
});

export const changePasswordFormSchema = changePasswordFormObjectSchema
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Konfirmasi password tidak cocok',
    path: ['confirmNewPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'Password baru tidak boleh sama dengan password lama',
    path: ['newPassword'],
  });

export type ChangePasswordFormInput = z.infer<typeof changePasswordFormSchema>;
