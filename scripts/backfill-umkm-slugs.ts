import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { generateSlug } from '../lib/utils';

async function main() {
  const allUmkm = await prisma.umkmProfile.findMany({
    select: { id: true, businessName: true, slug: true },
  });

  console.log(`Ditemukan ${allUmkm.length} UMKM.`);

  const usedSlugs = new Set<string>();

  for (const umkm of allUmkm) {
    const baseSlug = generateSlug(umkm.businessName);
    let finalSlug = baseSlug;
    let counter = 2;

    // kalau ada 2 UMKM namanya persis sama (atau menghasilkan slug yang
    // sama), tambahin angka di belakang biar tetap unik
    while (usedSlugs.has(finalSlug)) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    usedSlugs.add(finalSlug);

    await prisma.umkmProfile.update({
      where: { id: umkm.id },
      data: { slug: finalSlug },
    });

    console.log(`${umkm.businessName} -> ${finalSlug}`);
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
