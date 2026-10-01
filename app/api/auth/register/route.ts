// app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/schemas/register.schema';
import { lowercaseFields, toLower } from '@/lib/text';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';
import { generateOtp, sendOtpEmail, OTP_EXPIRY_MS } from '@/lib/otp';
import { generateSlug } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rateLimit = await checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan registrasi. Coba lagi dalam ${Math.ceil((rateLimit.retryAfterSeconds ?? 0) / 60)} menit.`,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const data = lowercaseFields(parsed.data, [
      'password',
      'ownerNik',
      'ownerGender',
      'birthDate',
      'ownerPhone',
      'ownerKabupaten',
      'ktpUrl',
      'logoUrl',
      'nibNumber',
      'nibUrl',
      'businessKabupaten',
      'businessCategoryId',
      'customBusinessCategory',
      'annualRevenue',
      'businessContactNumber',
    ]);

    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 409 });
    }

    // --- HANDLE KATEGORI USAHA KUSTOM ("LAINNYA") ---
    let targetBusinessCategoryId = data.businessCategoryId;

    if (data.businessCategoryId === 'lainnya') {
      const customCategoryName = (data.customBusinessCategory || '').trim();
      if (!customCategoryName) {
        return NextResponse.json({ error: 'Nama kategori usaha wajib diisi jika memilih Lainnya' }, { status: 400 });
      }

      const slug = generateSlug(customCategoryName);

      let existingCategory = await prisma.businessCategory.findFirst({
        where: {
          OR: [{ slug }, { name: { equals: customCategoryName, mode: 'insensitive' } }],
        },
      });

      if (!existingCategory) {
        existingCategory = await prisma.businessCategory.create({
          data: {
            name: toLower(customCategoryName),
            slug,
          },
        });
      }

      targetBusinessCategoryId = existingCategory.id;
    } else {
      const businessCategory = await prisma.businessCategory.findUnique({
        where: { id: targetBusinessCategoryId },
      });

      if (!businessCategory) {
        return NextResponse.json({ error: 'Kategori usaha tidak valid' }, { status: 404 });
      }
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const otpCode = generateOtp();
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    const baseSlug = generateSlug(data.businessName);
    let slug = baseSlug;
    let slugCounter = 2;

    while (await prisma.umkmProfile.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    await prisma.user.create({
      data: {
        name: data.ownerName,
        email: data.email,
        password: hashedPassword,
        role: toLower('umkm'),
        otpCode,
        otpExpiresAt,
        umkmProfile: {
          create: {
            slug,
            ownerName: data.ownerName,
            ownerNik: data.ownerNik,
            ownerGender: data.ownerGender,
            birthDate: new Date(data.birthDate),
            ownerPhone: data.ownerPhone,
            ownerKecamatan: data.ownerKecamatan,
            ownerKabupaten: data.ownerKabupaten,
            ownerAddress: data.ownerAddress,
            ktpUrl: data.ktpUrl,
            businessName: data.businessName,
            logoUrl: data.logoUrl || null,
            nibNumber: data.nibNumber,
            nibUrl: data.nibUrl,
            establishedYear: data.establishedYear,
            businessKecamatan: data.businessKecamatan,
            businessKabupaten: data.businessKabupaten,
            businessAddress: data.businessAddress,
            businessType: data.businessType,
            businessCategoryId: targetBusinessCategoryId,
            annualRevenue: data.annualRevenue,
            businessContactNumber: data.businessContactNumber,
          },
        },
      },
    });

    try {
      await sendOtpEmail(data.email, data.ownerName, otpCode);
    } catch (emailError) {
      console.error('Send OTP email error:', emailError);
    }

    return NextResponse.json(
      {
        message: 'Registrasi berhasil, silakan verifikasi email anda',
        email: data.email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}
