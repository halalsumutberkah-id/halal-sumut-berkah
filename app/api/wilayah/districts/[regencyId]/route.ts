import { NextRequest, NextResponse } from 'next/server';
import { enforcePublicRateLimit } from '@/lib/public-rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ regencyId: string }> }) {
  try {
    const limited = await enforcePublicRateLimit(req, 'public-wilayah');
    if (limited) return limited;

    const { regencyId } = await params;

    const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`, { next: { revalidate: 60 * 60 * 24 } });

    if (!res.ok) {
      return NextResponse.json({ error: 'Gagal memuat data kecamatan' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Get districts error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
