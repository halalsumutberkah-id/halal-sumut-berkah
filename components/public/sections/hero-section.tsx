// components/public/sections/hero-section.tsx

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

function HeroCta() {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      <Button
        render={
          <Link href="/umkm/register">
            Promosikan Usaha Anda
            <ArrowRight className="size-4" />
          </Link>
        }
        nativeButton={false}
        className="h-auto rounded-full bg-yellow-500 px-6 py-3 font-semibold text-neutral-900 hover:bg-yellow-400"
      />
      <Button
        variant="outline"
        render={
          <Link href="/produk-halal">
            <Search className="size-4" />
            Jelajahi Produk Halal
          </Link>
        }
        nativeButton={false}
        className="h-auto rounded-full border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 font-medium text-primary-foreground hover:bg-primary-foreground hover:text-primary"
      />
    </div>
  );
}

function HeroHeading() {
  return (
    <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl">
      <span className="block whitespace-nowrap text-primary-foreground">Wujudkan Produk Halal</span>
      <span className="block whitespace-nowrap text-yellow-400">Raih Berkah Tanpa Batas</span>
    </h1>
  );
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-primary">
      {/* ================= DESKTOP (lg+) - split layout, gambar
          full-bleed di kanan, teks ngikut container standar ================= */}
      <div className="relative hidden min-h-[80vh] grid-cols-2 lg:grid">
        <div className="relative z-10 flex items-center px-10 2xl:pl-[calc((100vw-1536px)/2+2.5rem)]">
          <div className="flex max-w-xl flex-col gap-6">
            <HeroHeading />
            <p className="max-w-lg lg:max-w-xl text-base leading-relaxed text-primary-foreground/90 sm:text-lg">Pusat informasi, layanan sertifikasi halal dan promosi produk halal UMKM Sumatera Utara dalam satu platform terintegrasi.</p>
            <HeroCta />
          </div>
        </div>

        <div className="relative">
          <Image src="/images/hero-image.webp" alt="Produk UMKM halal Sumatera Utara" fill priority className="object-cover" sizes="50vw" />
          {/* gradient blend dari biru primary (kiri, nyatu ke panel teks)
              ke transparan (kanan, gambar kelihatan penuh) */}
          <div className="absolute inset-0 bg-linear-to-r from-primary via-primary/40 to-transparent" />
        </div>
      </div>

      {/* ================= MOBILE/TABLET (<lg) - gambar background
          penuh + overlay gelap, teks di atasnya, pola hero versi awal ================= */}
      <div className="relative lg:hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/hero-image.webp)' }} />
        <div className="absolute inset-0 bg-primary/85" />

        <div className="relative flex min-h-[60vh] items-center px-4 py-16 sm:min-h-[70vh] sm:px-6 md:py-20">
          <div className="flex max-w-xl flex-col gap-6">
            <HeroHeading />
            <p className="max-w-lg text-base leading-relaxed text-primary-foreground/90 sm:text-lg">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <HeroCta />
          </div>
        </div>
      </div>
    </section>
  );
}
