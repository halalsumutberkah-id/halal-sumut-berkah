import { z } from 'zod';

export const PRODUCT_VERIFICATION_STATUSES = ['pending', 'terverifikasi', 'ditolak'] as const;

export const updateProductVerificationSchema = z.object({
  verificationStatus: z.enum(PRODUCT_VERIFICATION_STATUSES, { message: 'Status tidak valid' }),
  adminNote: z.string().optional().or(z.literal('')),
});
