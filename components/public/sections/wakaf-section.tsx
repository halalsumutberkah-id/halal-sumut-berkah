// components/public/sections/wakaf-section.tsx

import Link from 'next/link';
import { Globe, ScrollText, Store, Search, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ITEMS = [
  {
    icon: ScrollText,
    title: 'Pendaftaran Sertifikasi Halal',
    description: 'Daftar mudah dan cepat secara online',
  },
  {
    icon: Search,
    title: 'Pilih LP3H Terdekat',
    description: 'Bebas memilih LP3H di wilayah Sumatera Utara',
  },
  {
    icon: BookOpen,
    title: 'Edukasi & Informasi',
    description: 'Panduan lengkap seputar sertifikasi halal',
  },
  {
    icon: Store,
    title: 'Promosi Produk Halal UMKM',
    description: 'Tampilkan produk Anda ke pasar yang lebih luas',
  },
];

export function WakafSection() {
  return (
    <section className="relative z-20 mx-auto -mt-10 max-w-screen-2xl px-4 sm:-mt-14 sm:px-6 lg:-mt-16 lg:px-10">
      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 shadow-lg lg:flex-row lg:items-center lg:gap-8 lg:p-8">
        {/* KIRI - Wakaf Produktif Bank Indonesia */}
        <div className="flex flex-1 items-start gap-4 lg:max-w-xs lg:shrink-0">
          <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700 dark:bg-green-900/50 dark:text-green-300">
            <Globe className="size-6" />
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Terhubung dengan <span className="font-semibold text-primary">Wakaf Produktif Bank Indonesia</span>
            </p>
            <Button
              render={
                <Link href="https://wakafsumutberkah.id/" target="_blank" rel="noopener noreferrer">
                  Kunjungi Wakaf BI
                  <ArrowRight className="size-4" />
                </Link>
              }
              nativeButton={false}
              className="h-auto w-fit rounded-full px-5 py-2.5 text-sm font-medium"
            />
          </div>
        </div>

        {/* KANAN - 4 item mirip Stats, tapi tiap item punya border sendiri
            (bukan divide-x kayak Stats) */}
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border p-4 justify-center">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                  <Icon className="size-5 md:size-7" />
                </div>
                <div className="flex flex-col text-left ">
                  {/* TODO: ganti judul & teks tiap item sesuai konten asli */}
                  <span className="text-sm font-bold text-foreground">{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
