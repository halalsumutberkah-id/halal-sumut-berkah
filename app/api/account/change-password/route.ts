import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { changePasswordSchema } from '@/schemas/change-password.schema';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const currentUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Password lama salah' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diperbarui' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
