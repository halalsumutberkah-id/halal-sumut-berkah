// app/api/admin/lp3h/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { createLp3hSchema } from '@/schemas/lp3h.schema';
import { lowercaseFields } from '@/lib/text';
import { generateRandomPassword } from '@/lib/generate-password';
import { generateSlug } from '@/lib/utils';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const lp3hList = await prisma.lp3hProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
        _count: { select: { pendampings: true } },
      },
    });

    return NextResponse.json({ data: lp3hList });
  } catch (error) {
    console.error('Get lp3h list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('super_admin');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const parsed = createLp3hSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['logoUrl', 'description']);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    const rawPassword = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const baseSlug = generateSlug(data.name);
    let slug = baseSlug;
    let counter = 2;
    while (await prisma.lp3hProfile.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const lp3h = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: 'lp3h',
        lp3hProfile: {
          create: {
            name: data.name,
            slug,
            address: data.address,
            phone: data.phone,
            description: data.description,
            logoUrl: data.logoUrl,
          },
        },
      },
      include: { lp3hProfile: true },
    });

    return NextResponse.json(
      {
        message: 'Akun LP3H berhasil dibuat',
        data: lp3h,
        credentials: {
          email: data.email,
          password: rawPassword,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Create lp3h error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
