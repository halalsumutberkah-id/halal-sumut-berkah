import { auth } from '@/auth';
import { redirect } from 'next/navigation';

const LOGIN_PATH: Record<string, string> = {
  super_admin: '/admin/login',
  lph: '/lph/login',
  umkm: '/umkm/login',
};

const DASHBOARD_PATH: Record<string, string> = {
  super_admin: '/admin/dashboard',
  lph: '/lph/dashboard',
  umkm: '/umkm/dashboard',
};

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

// dipakai di route/layout yang tidak tahu role spesifik apa yang dibutuhkan,
// fallback ke halaman login umkm kalau tidak ada info lain
export async function requireUser(fallbackRole = 'umkm') {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH[fallbackRole]);
  return user;
}

export async function requireRole(role: string) {
  const user = await getCurrentUser();

  if (!user) redirect(LOGIN_PATH[role]);

  if (user.role !== role) {
    redirect(DASHBOARD_PATH[user.role] || LOGIN_PATH[role]);
  }

  return user;
}
