import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const unverifiedUmkm = await prisma.user.findMany({
    where: { role: 'umkm', emailVerifiedAt: null },
    select: { id: true, email: true, createdAt: true },
  });

  console.log(`Ditemukan ${unverifiedUmkm.length} akun UMKM lama yang belum terverifikasi.`);

  for (const user of unverifiedUmkm) {
    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: user.createdAt },
    });

    console.log(`Verified: ${user.email}`);
  }

  console.log('Selesai.');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
