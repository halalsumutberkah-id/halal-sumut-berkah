// app/api/admin/lp3h/[id]/reset-password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { generateRandomPassword } from '@/lib/generate-password';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const lp3h = await prisma.lp3hProfile.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!lp3h) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    await prisma.user.update({
      where: { id: lp3h.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: 'Password berhasil direset',
      credentials: {
        email: lp3h.user.email,
        password: rawPassword,
      },
    });
  } catch (error) {
    console.error('Reset lp3h password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
