// app/api/auth/forgot-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/schemas/reset-password.schema';
import { toLower } from '@/lib/text';
import { generateResetToken, sendResetPasswordEmail, RESET_TOKEN_EXPIRY_MS } from '@/lib/reset-token';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

export const dynamic = 'force-dynamic';

// pesan sukses generic yang SELALU dibalas, apapun hasilnya di belakang layar -
// baik email tidak ketemu, bukan role umkm, atau memang berhasil kirim.
// ini sengaja (anti user-enumeration): kalau pesannya beda-beda tergantung
// email terdaftar atau tidak, orang bisa dipakai buat "scan" email siapa
// saja yang punya akun UMKM di sistem kita
const GENERIC_SUCCESS_MESSAGE = 'Jika email tersebut terdaftar, kami sudah mengirimkan link reset password.';

export async function POST(req: NextRequest) {
  try {
    // maksimal 3 kali minta reset per jam per email, DAN 10 kali per jam per IP
    const ip = getClientIp(req);
    const body = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const email = toLower(parsed.data.email);

    const emailRateLimit = await checkRateLimit(`forgot-password-email:${email}`, 3, 60 * 60 * 1000);
    const ipRateLimit = await checkRateLimit(`forgot-password-ip:${ip}`, 10, 60 * 60 * 1000);

    if (!emailRateLimit.allowed || !ipRateLimit.allowed) {
      // tetap balas generic message walau kena rate limit, jangan bocorin
      // bahwa email ini SERING diminta reset (itu juga bentuk enumeration)
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // cuma proses kalau user ketemu DAN role-nya umkm atau lp3h - admin
    // tidak didukung reset mandiri lewat jalur ini (akun admin dikelola
    // manual, bukan self-service)
    if (user && (user.role === 'umkm' || user.role === 'lp3h')) {
      const token = generateResetToken();
      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiresAt: expiresAt },
      });

      await sendResetPasswordEmail(user.email, user.name, token);
    }

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
