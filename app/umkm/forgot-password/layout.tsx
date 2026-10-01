import type { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Lupa Password',
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
