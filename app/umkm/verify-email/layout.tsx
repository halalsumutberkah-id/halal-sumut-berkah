import type { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Verifikasi Email',
  noIndex: true,
});

export default function VerifyEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
