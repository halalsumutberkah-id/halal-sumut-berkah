// app/api/admin/products/[id]/verify/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { updateProductVerificationSchema } from '@/schemas/product-verification.schema';
import { sendProductVerificationEmail } from '@/lib/product-verification-email';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireRole('super_admin');
    const { id } = await params;

    const body = await req.json();
    const parsed = updateProductVerificationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        umkm: {
          select: { userId: true, ownerName: true, user: { select: { email: true } } },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    // Tentukan penyesuaian halalStatus berdasarkan aksi Admin
    const hasHalalNumber = Boolean(product.halalCertNumber?.trim());
    let newHalalStatus = product.halalStatus;

    if (parsed.data.verificationStatus === 'terverifikasi' && hasHalalNumber) {
      newHalalStatus = 'halal';
    } else if (parsed.data.verificationStatus === 'ditolak') {
      newHalalStatus = 'belum_halal';
    }

    const isNowVerified = parsed.data.verificationStatus === 'terverifikasi';

    const updated = await prisma.product.update({
      where: { id },
      data: {
        verificationStatus: parsed.data.verificationStatus,
        adminNote: parsed.data.adminNote || null,
        halalStatus: newHalalStatus,
        // terverifikasi -> otomatis publish ke katalog, tidak lagi lewat
        // dialog manual. selain terverifikasi (pending/ditolak) -> otomatis
        // ditarik dari publikasi
        isPublished: isNowVerified ? true : false,
      },
    });

    // Notifikasi in-app ke UMKM
    if (parsed.data.verificationStatus !== 'pending') {
      await prisma.notification.create({
        data: {
          userId: product.umkm.userId,
          type: 'product_verification',
          title: isNowVerified ? 'Produk Terverifikasi & Terbit' : 'Produk Perlu Perbaikan',
          message: isNowVerified ? `${product.name} telah diverifikasi dan otomatis dipublikasikan ke katalog.` : `${product.name} perlu diperbaiki. Cek catatan Admin di menu E-Catalog.`,
          link: '/umkm/products',
        },
      });

      // Kirim email notifikasi ke UMKM
      try {
        await sendProductVerificationEmail(product.umkm.user.email, product.umkm.ownerName, product.name, parsed.data.verificationStatus as 'terverifikasi' | 'ditolak', parsed.data.adminNote);
      } catch (emailError) {
        console.error('Send product verification email error:', emailError);
      }
    }

    const wasUnpublished = !isNowVerified && product.isPublished;

    return NextResponse.json({
      message: isNowVerified
        ? 'Produk berhasil diverifikasi dan otomatis dipublikasikan ke katalog publik.'
        : wasUnpublished
          ? 'Status verifikasi berhasil diperbarui. Produk otomatis ditarik dari katalog publik karena tidak lagi terverifikasi.'
          : 'Status verifikasi berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Verify product error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
