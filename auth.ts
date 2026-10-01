// auth.ts

import NextAuth, { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authConfig } from '@/auth.config';
import { loginSchema } from '@/schemas/auth.schema';
import { toLower } from '@/lib/text';
import { checkRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/get-client-ip';

// custom error class biar kode error-nya nyampe utuh ke client (result.error
// dari signIn()) - kalau cuma throw Error biasa, NextAuth collapse semua
// jadi "CredentialsSignin" generic, pesan aslinya hilang
class EmailNotVerifiedError extends CredentialsSignin {
  code = 'email_not_verified';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const lowerEmail = toLower(email);
        const ip = getClientIp(req);

        // maksimal 10 percobaan login per 15 menit per email (cegah brute-force
        // 1 akun spesifik), DAN maksimal 20 percobaan per 15 menit per IP
        // (cegah 1 penyerang nyoba banyak email berbeda dari IP yang sama)
        const emailLimit = await checkRateLimit(`login-email:${lowerEmail}`, 10, 15 * 60 * 1000);
        const ipLimit = await checkRateLimit(`login-ip:${ip}`, 20, 15 * 60 * 1000);

        if (!emailLimit.allowed || !ipLimit.allowed) {
          throw new Error('Terlalu banyak percobaan login, coba lagi beberapa saat lagi');
        }

        const user = await prisma.user.findUnique({
          where: { email: lowerEmail },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) return null;

        // cuma role umkm yang wajib verifikasi email (self-register lewat
        // form publik) - admin & lp3h dibuat manual sama super admin, sudah
        // otomatis dipercaya, tidak perlu OTP
        if (user.role === 'umkm' && !user.emailVerifiedAt) {
          throw new EmailNotVerifiedError();
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  // jwt & session callback sudah didefinisikan di authConfig (auth.config.ts)
  // dan otomatis ikut ke-spread dari ...authConfig di atas, tidak perlu ditulis ulang di sini
});
