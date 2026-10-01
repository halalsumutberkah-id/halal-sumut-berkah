import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resendOtpSchema } from '@/schemas/otp.schema';
import { toLower } from '@/lib/text';
import { generateOtp, sendOtpEmail, OTP_EXPIRY_MS } from '@/lib/otp';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // maksimal 3 kali kirim ulang per jam per email, cegah spam kirim email
    const ip = getClientIp(req);
    const body = await req.json();
    const parsed = resendOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const email = toLower(parsed.data.email);

    const emailRateLimit = await checkRateLimit(`resend-otp-email:${email}`, 3, 60 * 60 * 1000);
    const ipRateLimit = await checkRateLimit(`resend-otp-ip:${ip}`, 10, 60 * 60 * 1000);

    if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan kirim ulang, coba lagi nanti.' }, { status: 429 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Akun tidak ditemukan' }, { status: 404 });
    }

    if (user.emailVerifiedAt) {
      return NextResponse.json({ message: 'Email sudah terverifikasi' });
    }

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode, otpExpiresAt },
    });

    await sendOtpEmail(user.email, user.name, otpCode);

    return NextResponse.json({ message: 'Kode OTP baru sudah dikirim' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
