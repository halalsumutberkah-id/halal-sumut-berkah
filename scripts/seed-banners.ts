import 'dotenv/config';
import { prisma } from '../lib/prisma';

const BANNERS = [
  {
    imageUrl: 'https://placehold.co/800x1000/1D7A9C/FFFFFF.png?text=Banner+1',
    link: 'https://halalsumutberkah.id/produk-halal',
    sequence: 0,
  },
  {
    imageUrl: 'https://placehold.co/800x1000/FABC09/1F2937.png?text=Banner+2',
    link: 'https://halalsumutberkah.id/lp3h-sumut',
    sequence: 1,
  },
  {
    imageUrl: 'https://placehold.co/800x1000/16A34A/FFFFFF.png?text=Banner+3',
    link: null,
    sequence: 2,
  },
];

async function main() {
  const existingCount = await prisma.banner.count();
  if (existingCount > 0) {
    console.log(`Sudah ada ${existingCount} banner di database, seed dilewati.`);
    console.log('Kalau mau tetap seed ulang, hapus dulu banner yang ada lewat /admin/banners.');
    return;
  }

  for (const banner of BANNERS) {
    const created = await prisma.banner.create({
      data: {
        imageUrl: banner.imageUrl,
        link: banner.link,
        sequence: banner.sequence,
        isActive: true,
      },
    });
    console.log(`Banner dibuat: sequence ${created.sequence} - ${created.imageUrl}`);
  }

  console.log('');
  console.log('3 banner testing berhasil dibuat, semuanya aktif.');
  console.log('Buka halaman publik (mode incognito atau clear localStorage dulu kalau pernah');
  console.log('nutup pop-up sebelumnya) buat lihat pop-up slider-nya muncul.');
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
