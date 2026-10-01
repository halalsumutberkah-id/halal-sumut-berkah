// app/berita/layout.tsx

import type { Metadata } from 'next';
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';

// count total berita di-cache 5 menit - ini cuma dipakai buat teks
// deskripsi SEO, gak butuh akurat sampai ke angka pas. Dulu query jalan
// tiap kali ada yang buka halaman apapun di bawah /berita
const getPublishedNewsCount = unstable_cache(
  async () => {
    return prisma.news.count({ where: { isPublished: true } });
  },
  ['berita-layout-count'],
  { revalidate: 300, tags: ['news'] },
);

export async function generateMetadata(): Promise<Metadata> {
  const total = await getPublishedNewsCount();

  return buildMetadata({
    title: 'Berita & Kegiatan',
    description: `${total} berita dan agenda kegiatan seputar program sertifikasi halal di Sumatera Utara.`,
    path: '/berita',
  });
}

export default function BeritaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
