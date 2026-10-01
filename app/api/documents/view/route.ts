// app/api/document-proxy/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireUser();

    const src = req.nextUrl.searchParams.get('src');
    if (!src) {
      return NextResponse.json({ error: 'Parameter src wajib diisi' }, { status: 400 });
    }

    let target: URL;
    try {
      target = new URL(src);
    } catch {
      return NextResponse.json({ error: 'URL tidak valid' }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const isAllowedHost = target.hostname === 'res.cloudinary.com';
    const isAllowedCloud = !cloudName || target.pathname.startsWith(`/${cloudName}/`);

    if (!isAllowedHost || !isAllowedCloud) {
      return NextResponse.json({ error: 'Sumber berkas tidak diizinkan' }, { status: 403 });
    }

    const fileRes = await fetch(target.toString());
    if (!fileRes.ok || !fileRes.body) {
      return NextResponse.json({ error: 'Gagal memuat berkas' }, { status: 502 });
    }

    // stream langsung dari Cloudinary ke client, tidak di-buffer penuh
    // ke memory (arrayBuffer()) dulu - lebih hemat memory & CPU buat
    // file besar (PDF/dokumen)
    const contentType = fileRes.headers.get('content-type') ?? 'application/octet-stream';
    const contentLength = fileRes.headers.get('content-length');

    return new NextResponse(fileRes.body, {
      headers: {
        'Content-Type': contentType,
        ...(contentLength ? { 'Content-Length': contentLength } : {}),
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('Document proxy error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
