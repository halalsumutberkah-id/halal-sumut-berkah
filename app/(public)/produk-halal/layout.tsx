import type { Metadata } from 'next';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Katalog Produk Halal Sumatera Utara',
  description: 'Temukan produk-produk UMKM bersertifikat halal dari seluruh Sumatera Utara.',
  path: '/produk-halal',
});

export default function ProdukHalalLayout({ children }: { children: React.ReactNode }) {
  return children;
}
