import type { Metadata } from 'next';
import { requireRole } from '@/lib/session';
import { AdminShell } from '@/components/admin/admin-shell';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Dashboard Admin',
  noIndex: true,
});

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('super_admin');

  return (
    <AdminShell name={user.name ?? 'Super Admin'} email={user.email ?? ''}>
      {children}
    </AdminShell>
  );
}
