// app/lp3h/(dashboard)/layout.tsx

import type { Metadata } from 'next';
import { requireRole } from '@/lib/session';
import { Lp3hShell } from '@/components/lp3h/lp3h-shell';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Dashboard LP3H',
  noIndex: true,
});

export default async function Lp3hDashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole('lp3h');

  return (
    <Lp3hShell name={user.name ?? 'LP3H'} email={user.email ?? ''}>
      {children}
    </Lp3hShell>
  );
}
