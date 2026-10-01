import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  const staleNotifications = await prisma.notification.findMany({
    where: {
      link: { startsWith: '/dashboard/' },
    },
  });

  console.log(`Ditemukan ${staleNotifications.length} notifikasi dengan link lama.`);

  for (const notif of staleNotifications) {
    if (!notif.link) continue;

    const fixedLink = notif.link.replace('/dashboard/', '/');

    await prisma.notification.update({
      where: { id: notif.id },
      data: { link: fixedLink },
    });

    console.log(`Fixed: ${notif.link} -> ${fixedLink}`);
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
