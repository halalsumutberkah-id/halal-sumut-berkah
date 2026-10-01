// components/public/sections/syarat-prosedur-promo-section.tsx

import Link from 'next/link';
import { UserPlus, Package, Users, ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    icon: UserPlus,
    number: 1,
    title: 'Daftar',
    description: 'Buat akun dan isi data pendaftaran.',
  },
  {
    icon: Package,
    number: 2,
    title: 'Tambah Produk',
    description: 'Lengkapi data produk di E-Catalog.',
  },
  {
    icon: Users,
    number: 3,
    title: 'Ajukan Sertifikasi',
    description: 'Pilih Self Declare atau Reguler.',
  },
  {
    icon: ShieldCheck,
    number: 4,
    title: 'Bersertifikat Halal',
    description: 'Produk tampil di Katalog Halal.',
  },
];

export function SyaratProsedurPromoSection() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="border-l-4 border-yellow-500 pl-4">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Syarat & Prosedur Pendaftaran</h2>
            <p className="mt-1 text-sm text-muted-foreground">Rangkaian tahapan dari pendaftaran hingga produk resmi bersertifikat halal.</p>
          </div>
          <Button
            variant="outline"
            render={
              <Link href="/syarat-prosedur">
                <BookOpen className="size-4" />
                Baca Panduan Lengkap
              </Link>
            }
            nativeButton={false}
            className="w-fit shrink-0 rounded-full"
          />
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative flex flex-col items-start gap-2 text-left">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                  <Icon className="size-6" />
                </div>
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {step.number}. {step.title}
                </span>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>

                {i < STEPS.length - 1 && <ArrowRight className="absolute -right-5 top-5 hidden size-5 text-muted-foreground/30 lg:block" />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
