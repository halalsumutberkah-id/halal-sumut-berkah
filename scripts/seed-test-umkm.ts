import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { toLower } from '../lib/text';
import { generateSlug } from '../lib/utils';

async function main() {
  const email = process.env.SEED_TEST_UMKM_EMAIL || 'umkm-test@halalsumutberkah.id';
  const password = process.env.SEED_TEST_UMKM_PASSWORD || 'password123';

  const lowerEmail = toLower(email);

  const existing = await prisma.user.findUnique({ where: { email: lowerEmail } });
  if (existing) {
    console.log(`Akun UMKM testing dengan email ${lowerEmail} sudah ada, seed dilewati.`);
    console.log(`Login pakai: ${lowerEmail} / (password sesuai saat pertama kali dibuat)`);
    return;
  }

  // pastikan minimal ada 1 kategori usaha - kalau belum ada sama sekali,
  // buatkan 1 kategori dummy biar seed ini bisa jalan berdiri sendiri
  let businessCategory = await prisma.businessCategory.findFirst();
  if (!businessCategory) {
    const baseSlug = generateSlug('kuliner');
    businessCategory = await prisma.businessCategory.create({
      data: { name: 'kuliner', slug: baseSlug },
    });
    console.log('Kategori usaha "Kuliner" dibuat otomatis (belum ada kategori sama sekali).');
  }

  // pastikan minimal ada 1 kategori produk juga (dipakai kalau langsung
  // mau testing tambah produk di E-Catalog)
  let category = await prisma.category.findFirst();
  if (!category) {
    const baseSlug = generateSlug('makanan ringan');
    category = await prisma.category.create({
      data: { name: 'makanan ringan', slug: baseSlug },
    });
    console.log('Kategori produk "Makanan Ringan" dibuat otomatis.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const baseSlug = generateSlug('warung berkah testing');
  let slug = baseSlug;
  let counter = 2;
  while (await prisma.umkmProfile.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  const user = await prisma.user.create({
    data: {
      name: 'budi santoso',
      email: lowerEmail,
      password: hashedPassword,
      role: 'umkm',
      emailVerifiedAt: new Date(), // langsung terverifikasi, skip OTP
      umkmProfile: {
        create: {
          slug,

          // a. data pelaku usaha
          ownerName: 'budi santoso',
          ownerNik: '1271010101900001',
          birthDate: new Date('1990-01-01'),
          ownerPhone: '081234567890',
          ownerKecamatan: 'medan kota',
          ownerKabupaten: 'kota medan',
          ownerAddress: 'jl. testing no. 1',
          ktpUrl: 'https://placehold.co/600x400?text=KTP+Testing',

          // b. data usaha
          businessName: 'warung berkah testing',
          logoUrl: 'https://placehold.co/400x400?text=Logo',
          nibNumber: '1234567890123',
          nibUrl: 'https://placehold.co/600x400?text=NIB+Testing',
          establishedYear: 2020,
          businessKecamatan: 'medan kota',
          businessKabupaten: 'kota medan',
          businessAddress: 'jl. testing usaha no. 2',
          businessType: 'perorangan',
          businessCategoryId: businessCategory.id,
          annualRevenue: 'rp 100.000.000',
          businessContactNumber: '081234567891',
        },
      },
    },
    include: { umkmProfile: true },
  });

  console.log('Akun UMKM testing berhasil dibuat:');
  console.log(`  Email    : ${user.email}`);
  console.log(`  Password : ${password}`);
  console.log(`  Nama Usaha: ${user.umkmProfile?.businessName}`);
  console.log(`  Kategori Produk tersedia: ${category.name} (id: ${category.id})`);
  console.log('  Status   : sudah terverifikasi, langsung bisa login tanpa OTP');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
