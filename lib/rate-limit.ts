// lib/rate-limit.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const now = new Date();

  const rows = await prisma.$queryRaw<{ count: number; windowStart: Date }[]>`
    INSERT INTO "rate_limits" (id, key, count, "windowStart")
    VALUES (gen_random_uuid()::text, ${key}, 1, ${now})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE
        WHEN EXTRACT(EPOCH FROM (${now}::timestamp - "rate_limits"."windowStart")) * 1000 > ${windowMs}
          THEN 1
        ELSE "rate_limits".count + 1
      END,
      "windowStart" = CASE
        WHEN EXTRACT(EPOCH FROM (${now}::timestamp - "rate_limits"."windowStart")) * 1000 > ${windowMs}
          THEN ${now}
        ELSE "rate_limits"."windowStart"
      END
    RETURNING count, "windowStart"
  `;

  const row = rows[0];

  if (!row) {
    return { allowed: true, remaining: limit - 1 };
  }

  if (row.count > limit) {
    const elapsedMs = now.getTime() - new Date(row.windowStart).getTime();
    const retryAfterSeconds = Math.ceil((windowMs - elapsedMs) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(retryAfterSeconds, 1) };
  }

  return { allowed: true, remaining: limit - row.count };
}

export async function enforceRateLimit(key: string, limit: number, windowMs: number): Promise<NextResponse | null> {
  const result = await checkRateLimit(key, limit, windowMs);

  if (!result.allowed) {
    const minutes = Math.ceil((result.retryAfterSeconds ?? 0) / 60);
    return NextResponse.json({ error: `Terlalu banyak permintaan. Coba lagi dalam ${minutes} menit.` }, { status: 429 });
  }

  return null;
}
