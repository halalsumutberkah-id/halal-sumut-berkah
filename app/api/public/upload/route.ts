// app/api/public/upload/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { cloudinary } from '@/lib/cloudinary';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

export const dynamic = 'force-dynamic';

// dibatasi ketat karena endpoint ini publik (dipakai saat registrasi, sebelum akun ada)
const ALLOWED_FOLDERS = ['umkm-documents', 'pendamping-documents'];

// gambar + PDF - client (uploadDocument di lib/upload-file.ts) convert
// file gambar ke WEBP dulu sebelum dikirim, TAPI untuk dokumen legalitas
// (NIB, sertifikat halal, PIRT, BPOM, dst) PDF dikirim apa adanya tanpa
// dikompres, jadi endpoint ini WAJIB terima keduanya
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    // maksimal 20 upload per jam per IP, cegah kuota storage/bandwidth
    // Cloudinary jebol karena endpoint ini bisa diakses tanpa login
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`public-upload:${ip}`, 20, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan upload. Coba lagi dalam ${Math.ceil((rateLimit.retryAfterSeconds ?? 0) / 60)} menit.`,
        },
        { status: 429 },
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File tidak ditemukan' }, { status: 400 });
    }

    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json({ error: 'Folder tidak diizinkan' }, { status: 400 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Format file harus JPG, PNG, WEBP, atau PDF' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Ukuran file maksimal 5MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(base64, {
      folder,
      resource_type: 'auto',
    });

    return NextResponse.json({ url: result.secure_url });
  } catch (error) {
    console.error('Public upload error:', error);
    return NextResponse.json({ error: 'Gagal upload file' }, { status: 500 });
  }
}
