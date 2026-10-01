import { z } from 'zod';

const PERIOD_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/;

export const statisticSchema = z.object({
  period: z.string().regex(PERIOD_REGEX, 'Format periode harus YYYY-MM, contoh: 2026-01'),
  kabupaten: z.string().min(1, 'Kabupaten wajib dipilih'),
  certifiedCount: z.number().int('Jumlah harus bilangan bulat').nonnegative('Jumlah tidak boleh negatif'),
});

export type StatisticInput = z.infer<typeof statisticSchema>;
