import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { toLower } from '../lib/text';

async function seedAdmin(options: { emailEnvKey: string; passwordEnvKey: string; nameEnvKey: string; required: boolean }) {
  const { emailEnvKey, passwordEnvKey, nameEnvKey, required } = options;

  const email = process.env[emailEnvKey];
  const password = process.env[passwordEnvKey];
  const name = process.env[nameEnvKey] || 'super admin';

  if (!email || !password) {
    if (required) {
      throw new Error(`${emailEnvKey} dan ${passwordEnvKey} wajib diisi di .env sebelum menjalankan seed`);
    }
    console.log(`${emailEnvKey} belum diisi, seed admin ini dilewati (opsional).`);
    return;
  }

  const lowerEmail = toLower(email);

  const existing = await prisma.user.findUnique({
    where: { email: lowerEmail },
  });

  if (existing) {
    console.log(`Akun super admin dengan email ${lowerEmail} sudah ada, seed dilewati.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: toLower(name),
      email: lowerEmail,
      password: hashedPassword,
      role: 'super_admin',
    },
  });

  console.log(`Akun super admin berhasil dibuat: ${admin.email}`);
}

async function main() {
  await seedAdmin({
    emailEnvKey: 'SEED_ADMIN_EMAIL',
    passwordEnvKey: 'SEED_ADMIN_PASSWORD',
    nameEnvKey: 'SEED_ADMIN_NAME',
    required: true,
  });

  await seedAdmin({
    emailEnvKey: 'SEED_ADMIN2_EMAIL',
    passwordEnvKey: 'SEED_ADMIN2_PASSWORD',
    nameEnvKey: 'SEED_ADMIN2_NAME',
    required: false,
  });
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
