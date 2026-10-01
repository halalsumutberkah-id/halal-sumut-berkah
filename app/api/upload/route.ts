// app/api/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Daftar format MIME yang diizinkan (ditambahkan image/jpg & perlakuan lowercase)
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

const ALLOWED_FOLDERS = ['umkm-documents', 'umkm-logos', 'umkm-products'];

const MAX_FILE_SIZE_BYTES = 3.5 * 1024 * 1024; // 3.5 MB

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. PROTEKSI RATE LIMIT: Maksimal 20 upload per 10 menit per IP
    const rateLimit = await checkRateLimit(`upload:${ip}`, 20, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak permintaan unggah. Coba lagi dalam ${Math.ceil((rateLimit.retryAfterSeconds ?? 0) / 60)} menit.`,
        },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const requestedFolder = (formData.get('folder') as string) || 'umkm-documents';

    // 2. VALIDASI KEBERADAAN DAN TIPE INSTANCE BERKAS
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'Berkas tidak ditemukan atau tidak valid' }, { status: 400 });
    }

    // 3. VALIDASI UKURAN FILE (Server-Side)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: 'Ukuran berkas melebihi batas maksimal 3.5 MB' }, { status: 400 });
    }

    // 4. VALIDASI TIPE MIME
    const fileType = file.type?.toLowerCase() || '';
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json({ error: 'Format berkas tidak didukung. Hanya JPG, PNG, WEBP, dan PDF yang diperbolehkan.' }, { status: 400 });
    }

    // 5. VALIDASI FOLDER (Fallback aman ke umkm-documents jika folder asing)
    const folder = ALLOWED_FOLDERS.includes(requestedFolder) ? requestedFolder : 'umkm-documents';

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = fileType || 'application/octet-stream';
    const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64Data, {
      folder,
      resource_type: 'auto',
      timeout: 60000,
    });

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Upload route error:', error);
    return NextResponse.json({ error: error?.message || 'Gagal memproses berkas di server' }, { status: 500 });
  }
}
