import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Daftar sebagai UMKM',
  description: 'Daftarkan usaha anda untuk mengajukan sertifikasi halal di halalsumutberkah.id.',
  noIndex: true,
});

export default function UmkmRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
