// app/api/umkm/products/bulk/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { bulkProductSchema } from '@/schemas/bulk-product.schema';
import { lowercaseFields } from '@/lib/text';
import { getAdminIds } from '@/lib/get-admin-ids';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole('umkm');

    const umkm = await prisma.umkmProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, businessName: true },
    });
    if (!umkm) {
      return NextResponse.json({ error: 'Profil UMKM tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = bulkProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { categoryId, halalCertNumber, halalCertUrl } = lowercaseFields(
      {
        categoryId: parsed.data.categoryId,
        halalCertNumber: parsed.data.halalCertNumber,
        halalCertUrl: parsed.data.halalCertUrl,
      },
      ['categoryId', 'halalCertNumber', 'halalCertUrl'],
    );

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return NextResponse.json({ error: 'Kategori produk tidak valid' }, { status: 404 });
    }

    const hasHalalCert = Boolean(halalCertNumber?.trim());
    const halalStatus = hasHalalCert ? 'halal' : 'belum_halal';

    const createdProducts = await prisma.$transaction(
      parsed.data.products.map((item) => {
        // pirtUrl/bpomUrl/hakiUrl/slhsNumber/slhsUrl/advantages/ingredients/
        // productionProcess sudah dihapus dari productSchema, ikut hilang
        // dari bulkProductSchema juga - sesuaikan field yang tersisa
        const data = lowercaseFields(item, ['photoUrl', 'pirtNumber', 'bpomNumber', 'hakiNumber']);

        return prisma.product.create({
          data: {
            umkmId: umkm.id,
            categoryId,
            name: data.name,
            price: data.price,
            shortDescription: data.shortDescription,
            photoUrl: data.photoUrl,
            halalStatus,
            halalCertNumber: halalCertNumber || null,
            halalCertUrl: halalCertUrl || null,
            pirtNumber: data.pirtNumber || null,
            bpomNumber: data.bpomNumber || null,
            hakiNumber: data.hakiNumber || null,
            verificationStatus: 'pending',
            isPublished: false,
          },
        });
      }),
    );

    const adminIds = await getAdminIds();
    if (adminIds.length > 0) {
      await prisma.notification.createMany({
        data: adminIds.map((adminId) => ({
          userId: adminId,
          type: 'product_submitted_bulk',
          title: 'Produk Baru Menunggu Verifikasi',
          message: `${umkm.businessName} mengajukan ${createdProducts.length} produk sekaligus untuk diverifikasi.`,
          link: '/admin/products',
        })),
      });
    }

    return NextResponse.json({ message: `${createdProducts.length} produk berhasil ditambahkan`, data: createdProducts }, { status: 201 });
  } catch (error) {
    console.error('Bulk create products error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
