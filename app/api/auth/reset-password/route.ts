import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/schemas/reset-password.schema';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan, coba lagi beberapa saat lagi.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { resetToken: parsed.data.token },
    });

    if (!user) {
      return NextResponse.json({ error: 'Link reset password tidak valid atau sudah digunakan.' }, { status: 400 });
    }

    if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
      return NextResponse.json({ error: 'Link reset password sudah kedaluwarsa, silakan minta link baru.' }, { status: 400 });
    }

    // password TIDAK boleh di-lowercase - beda dari field teks biasa,
    // huruf besar/kecil di password itu signifikan
    const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    });

    return NextResponse.json({ message: 'Password berhasil diubah, silakan masuk' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
