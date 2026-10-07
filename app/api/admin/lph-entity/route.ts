// app/api/admin/lph-entity/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { lphEntitySchema } from '@/schemas/lph-entity.schema';
import { lowercaseFields } from '@/lib/text';
import { enforceRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireRole('super_admin');

    const lphList = await prisma.lph.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: lphList });
  } catch (error) {
    console.error('Get lph list error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('super_admin');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json();
    const parsed = lphEntitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    // kabupaten dikecualikan dari lowercase - harus persis sama sama
    // daftar KABUPATEN_SUMUT. registrationNumberBpjph & contactWhatsapp
    // dikecualikan karena kode/nomor, inspectionScope dikecualikan sama
    // pola kayak description (teks bebas, bukan label pendek)
    const data = lowercaseFields(parsed.data, ['kabupaten', 'description', 'registrationNumberBpjph', 'contactWhatsapp', 'inspectionScope']);

    const lph = await prisma.lph.create({
      data: {
        ...data,
        email: data.email || null,
        registrationNumberBpjph: data.registrationNumberBpjph || null,
        skValidUntil: data.skValidUntil ? new Date(data.skValidUntil) : null,
        inspectionScope: data.inspectionScope || null,
        contactWhatsapp: data.contactWhatsapp || null,
      },
    });

    return NextResponse.json({ message: 'LPH berhasil ditambahkan', data: lph }, { status: 201 });
  } catch (error) {
    console.error('Create lph error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
