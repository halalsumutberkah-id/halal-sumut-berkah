import Link from 'next/link';
import { Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Sedang Dalam Pengembangan - Sertifikasi Reguler',
  description: 'Halaman informasi sertifikasi halal jalur reguler sedang dalam tahap pengembangan.',
  path: '/regular',
});

export default function RegularPage() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Ikon Konstruksi */}
        <div className="flex size-20 items-center justify-center rounded-2xl bg-yellow-500/10 text-yellow-600 ring-8 ring-yellow-500/5 dark:bg-yellow-500/20 dark:text-yellow-400">
          <Hammer className="size-10" />
        </div>

        {/* Badge & Judul */}
        <span className="mt-6 rounded-full bg-primary/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary">Under Construction</span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Halaman Sedang Dalam Pengembangan</h1>

        {/* Deskripsi */}
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Layanan dan informasi seputar <strong>Sertifikasi Halal Jalur Reguler</strong> sedang kami siapkan untuk memberikan pengalaman terbaik bagi Anda. Silakan kembali lagi nanti!
        </p>

        {/* Tombol Aksi (Icon dihapus & Link disesuaikan ke /sertifikasi-gratis) */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button render={<Link href="/">Kembali ke Beranda</Link>} nativeButton={false} className="h-11 rounded-full px-6" />
          <Button variant="outline" render={<Link href="/sertifikasi-gratis">Lihat Jalur Self Declare</Link>} nativeButton={false} className="h-11 rounded-full px-6" />
        </div>
      </div>
    </main>
  );
}
