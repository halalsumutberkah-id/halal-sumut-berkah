// app/api/umkm/products/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { productSchema } from '@/schemas/product.schema';
import { lowercaseFields } from '@/lib/text';
import { enforceRateLimit } from '@/lib/rate-limit';
import { getAdminIds } from '@/lib/get-admin-ids';

export const dynamic = 'force-dynamic';

async function getOwnUmkmProfile(userId: string) {
  return prisma.umkmProfile.findUnique({
    where: { userId },
    select: { id: true, businessName: true },
  });
}

export async function GET() {
  try {
    const user = await requireRole('umkm');

    const umkm = await getOwnUmkmProfile(user.id);
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const products = await prisma.product.findMany({
      where: { umkmId: umkm.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true } },
      },
    });

    return NextResponse.json({ data: products });
  } catch (error) {
    console.error('Get umkm products error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('umkm');

    const limited = await enforceRateLimit(`mutation:${user.id}`, 30, 60 * 60 * 1000);
    if (limited) return limited;

    const umkm = await getOwnUmkmProfile(user.id);
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, ['photoUrl', 'halalCertNumber', 'halalCertUrl', 'pirtNumber', 'bpomNumber', 'hakiNumber', 'categoryId']);

    const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Kategori produk tidak valid' }, { status: 404 });
    }

    const hasHalalCert = Boolean(data.halalCertNumber?.trim());
    const halalStatus = hasHalalCert ? 'halal' : 'belum_halal';

    const product = await prisma.product.create({
      data: {
        umkmId: umkm.id,
        categoryId: data.categoryId,
        name: data.name,
        price: data.price,
        shortDescription: data.shortDescription,
        photoUrl: data.photoUrl,
        halalStatus,
        halalCertNumber: data.halalCertNumber || null,
        halalCertUrl: data.halalCertUrl || null,
        pirtNumber: data.pirtNumber || null,
        bpomNumber: data.bpomNumber || null,
        hakiNumber: data.hakiNumber || null,
        verificationStatus: 'pending',
        isPublished: false,
      },
    });

    const adminIds = await getAdminIds();
    if (adminIds.length > 0) {
      await prisma.notification.createMany({
        data: adminIds.map((adminId) => ({
          userId: adminId,
          type: 'product_submitted',
          title: 'Produk Baru Menunggu Verifikasi',
          message: `${umkm.businessName} mengajukan produk "${data.name}" untuk diverifikasi.`,
          link: `/admin/products/${product.id}`,
        })),
      });
    }

    return NextResponse.json({ message: 'Produk berhasil ditambahkan', data: product }, { status: 201 });
  } catch (error) {
    console.error('Create umkm product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
