// app/api/admin/lp3h/[id]/legality/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateLp3hLegalitySchema } from '@/schemas/lp3h-profile.schema';
import { lowercaseFields } from '@/lib/text';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// endpoint ini SENGAJA TERPISAH dari /api/lp3h/profile & /api/admin/lp3h/[id]/profile
// - cuma bisa diakses role super_admin, dan schema Zod yang dipakai
// (updateLp3hLegalitySchema) cuma punya 1 field: screenshot bukti
// registrasi SIHALAL. Jadi LP3H SECARA STRUKTURAL tidak mungkin bisa ubah
// legalitas, bukan cuma disembunyikan di UI
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const existing = await prisma.lp3hProfile.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'LP3H tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateLp3hLegalitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['registrationDocumentUrl']);

    const updated = await prisma.lp3hProfile.update({
      where: { id },
      data: {
        registrationDocumentUrl: data.registrationDocumentUrl,
      },
    });

    return NextResponse.json({ message: 'Legalitas LP3H berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update lp3h legality error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
