import type { Metadata } from 'next';
import { requireRole } from '@/lib/session';
import { UmkmShell } from '@/components/umkm/umkm-shell';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Dashboard UMKM',
  noIndex: true,
});

export default async function UmkmDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('umkm');

  return (
    <UmkmShell name={user.name ?? 'UMKM'} email={user.email ?? ''}>
      {children}
    </UmkmShell>
  );
}
