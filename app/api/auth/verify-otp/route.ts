// app/api/auth/verify-otp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOtpSchema } from '@/schemas/otp.schema';
import { toLower } from '@/lib/text';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // maksimal 10 percobaan verifikasi per 15 menit per IP, cegah brute-force
    // nebak-nebak kode OTP 6 digit
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`verify-otp:${ip}`, 10, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan, coba lagi beberapa saat lagi.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const email = toLower(parsed.data.email);

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: 'Email sudah terverifikasi' });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return NextResponse.json({ error: 'Kode OTP tidak ditemukan, minta kirim ulang' }, { status: 400 });
    }

    if (user.otpExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Kode OTP sudah kedaluwarsa, minta kirim ulang' }, { status: 400 });
    }

    if (user.otpCode !== parsed.data.otp) {
      return NextResponse.json({ error: 'Kode OTP salah' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), otpCode: null, otpExpiresAt: null },
    });

    return NextResponse.json({ message: 'Email berhasil diverifikasi' });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
