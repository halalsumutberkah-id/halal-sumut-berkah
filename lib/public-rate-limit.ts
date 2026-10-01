// lib/public-rate-limit.ts

import { NextRequest, NextResponse } from 'next/server';
import { getClientIp } from '@/lib/get-client-ip';

// in-memory, no DB hit. Per-instance only (not global-accurate across
// Vercel instances), tapi cukup buat redam bot/abuse kasar di endpoint
// publik read-only. Auto-cleanup lewat cek expired tiap panggilan.
const buckets = new Map<string, { count: number; windowStart: number }>();

const MAX_BUCKETS = 5000;

function cleanupIfNeeded() {
  if (buckets.size <= MAX_BUCKETS) return;
  const now = Date.now();
  for (const [k, v] of buckets) {
    if (now - v.windowStart > 5 * 60 * 1000) buckets.delete(k);
  }
}

export async function enforcePublicRateLimit(req: NextRequest, key = 'public-read') {
  const ip = getClientIp(req);
  const bucketKey = `${key}:${ip}`;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = 120;

  const existing = buckets.get(bucketKey);

  if (!existing || now - existing.windowStart > windowMs) {
    buckets.set(bucketKey, { count: 1, windowStart: now });
    cleanupIfNeeded();
    return null;
  }

  if (existing.count >= limit) {
    const retryAfterSeconds = Math.ceil((windowMs - (now - existing.windowStart)) / 1000);
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi sebentar lagi.' }, { status: 429, headers: { 'Retry-After': String(retryAfterSeconds) } });
  }

  existing.count++;
  return null;
}
