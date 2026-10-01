import type { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Reset Password',
  noIndex: true,
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
