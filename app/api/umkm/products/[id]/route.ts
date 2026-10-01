// app/api/umkm/products/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { productSchema } from '@/schemas/product.schema';
import { lowercaseFields } from '@/lib/text';
import { getAdminIds } from '@/lib/get-admin-ids';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function getOwnProduct(userId: string, productId: string) {
  return prisma.product.findFirst({
    where: { id: productId, umkm: { userId } },
    include: { umkm: { select: { id: true, businessName: true } } },
  });
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('umkm');
    const { id } = await params;

    const product = await prisma.product.findFirst({
      where: { id, umkm: { userId: user.id } },
      include: { category: { select: { name: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Get umkm product detail error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('umkm');
    const { id } = await params;

    const existing = await getOwnProduct(user.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
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

    const updated = await prisma.product.update({
      where: { id },
      data: {
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
        adminNote: null,
      },
    });

    if (existing.verificationStatus !== 'pending') {
      const adminIds = await getAdminIds();
      if (adminIds.length > 0) {
        await prisma.notification.createMany({
          data: adminIds.map((adminId) => ({
            userId: adminId,
            type: 'product_resubmitted',
            title: 'Produk Diajukan Ulang untuk Verifikasi',
            message: `${existing.umkm.businessName} memperbarui produk "${data.name}", perlu diverifikasi ulang.`,
            link: `/admin/products/${id}`,
          })),
        });
      }
    }

    return NextResponse.json({ message: 'Produk berhasil diperbarui', data: updated });
  } catch (error) {
    console.error('Update umkm product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireRole('umkm');
    const { id } = await params;

    const existing = await getOwnProduct(user.id, id);
    if (!existing) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const daftarMandiriCount = await prisma.daftarMandiriSubmission.count({
      where: { productId: id },
    });
    const sertifikasiGratisCount = await prisma.sertifikasiGratisProduct.count({
      where: { productId: id },
    });

    if (daftarMandiriCount > 0 || sertifikasiGratisCount > 0) {
      return NextResponse.json(
        {
          error: 'Produk ini tidak bisa dihapus karena memiliki riwayat pengajuan Self Declare/Sertifikasi Gratis. Hubungi Admin kalau produk ini benar-benar perlu dihapus.',
        },
        { status: 400 },
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Delete umkm product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
