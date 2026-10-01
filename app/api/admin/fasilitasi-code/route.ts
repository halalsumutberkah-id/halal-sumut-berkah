// app/api/admin/fasilitasi-code/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { createFasilitasiCodeSchema } from '@/schemas/fasilitasi-code.schema';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const codes = await prisma.fasilitasiCode.findMany({
      orderBy: { createdAt: 'asc' },
      include: { _count: { select: { submissions: true } } },
    });

    return NextResponse.json({ data: codes });
  } catch (error) {
    console.error('Get fasilitasi-code list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole('super_admin');

    const body = await req.json();
    const parsed = createFasilitasiCodeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const code = await prisma.fasilitasiCode.create({
      data: {
        code: parsed.data.code.toUpperCase(),
        quota: parsed.data.quota,
        isActive: parsed.data.isActive,
      },
    });

    return NextResponse.json({ message: 'Kode Fasilitasi berhasil ditambahkan', data: code }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Kode ini sudah pernah dipakai' }, { status: 400 });
    }
    console.error('Create fasilitasi-code error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
