import type { Metadata } from 'next';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Sertifikasi Halal Gratis (Daftar Mandiri)',
  description: 'Cara mengajukan fasilitasi sertifikasi halal Daftar Mandiri gratis untuk UMKM di Sumatera Utara lewat dashboard UMKM.',
  path: '/daftar-mandiri',
});

export default function DaftarMandiriLayout({ children }: { children: React.ReactNode }) {
  return children;
}
