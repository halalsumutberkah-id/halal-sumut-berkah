import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

const ROLE_BY_PREFIX: Record<string, string> = {
  '/admin': 'super_admin',
  '/lp3h': 'lp3h',
  '/umkm/dashboard': 'umkm',
  '/umkm/products': 'umkm',
  '/umkm/profile': 'umkm',
  '/umkm/settings': 'umkm',
};

const LOGIN_PATH: Record<string, string> = {
  super_admin: '/admin/login',
  lp3h: '/lp3h/login',
  umkm: '/umkm/login',
};

const DASHBOARD_PATH: Record<string, string> = {
  super_admin: '/admin/dashboard',
  lp3h: '/lp3h/dashboard',
  umkm: '/umkm/dashboard',
};

function getRequiredRole(pathname: string) {
  for (const prefix of Object.keys(ROLE_BY_PREFIX)) {
    if (pathname.startsWith(prefix)) return ROLE_BY_PREFIX[prefix];
  }
  return null;
}

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const requiredRole = getRequiredRole(pathname);

      if (!requiredRole) return true;

      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;

      if (!isLoggedIn) {
        return NextResponse.redirect(new URL(LOGIN_PATH[requiredRole], request.nextUrl));
      }

      if (role !== requiredRole) {
        const ownDashboard = DASHBOARD_PATH[role as string] || '/';
        return NextResponse.redirect(new URL(ownDashboard, request.nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
};
