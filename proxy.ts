// proxy.ts

import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/admin/((?!login).*)', '/lp3h/((?!login|forgot-password|reset-password).*)', '/umkm/dashboard/:path*', '/umkm/products/:path*', '/umkm/profile/:path*', '/umkm/settings/:path*'],
};
