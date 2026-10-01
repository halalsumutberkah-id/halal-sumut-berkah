import { NextRequest, NextResponse } from 'next/server';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

const SUMUT_PROVINCE_ID = '12';

export async function GET(req: NextRequest) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-wilayah');
    if (limited) return limited;

    const res = await fetch(
      `https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${SUMUT_PROVINCE_ID}.json`,
      { next: { revalidate: 60 * 60 * 24 } }, // cache 1 hari, data wilayah jarang berubah
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Gagal memuat data kabupaten/kota' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get regencies error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
