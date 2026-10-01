// app/(public)/daftar-mandiri/page.tsx

import Link from 'next/link';
import { ShieldCheck, LogIn, UserPlus, PackagePlus, FileCheck2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  { icon: UserPlus, title: 'Daftar Akun UMKM', description: 'Buat akun terlebih dahulu di halalsumutberkah.id kalau belum punya.' },
  { icon: PackagePlus, title: 'Tambahkan Produk', description: 'Isi data produk anda di menu E-Catalog pada dashboard.' },
  { icon: FileCheck2, title: 'Ajukan Sertifikasi Halal Gratis', description: 'Pilih produk, LP3H, dan Pendamping, lalu ajukan lewat dashboard.' },
];

export default function DaftarMandiriInfoPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6">
      <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="size-8" />
      </div>

      <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">Sertifikasi Halal Gratis (Daftar Mandiri)</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
        Pengajuan Sertifikasi Halal Gratis sekarang dilakukan lewat dashboard UMKM anda, bukan lagi lewat form publik. Ikuti 3 langkah berikut untuk mulai.
      </p>

      <div className="mt-10 flex w-full flex-col gap-4 text-left">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</div>
              <div>
                <div className="flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button
          render={
            <Link href="/umkm/register">
              <UserPlus className="size-4" />
              Daftar Akun UMKM
            </Link>
          }
          nativeButton={false}
        />
        <Button
          variant="outline"
          render={
            <Link href="/umkm/login">
              <LogIn className="size-4" />
              Sudah Punya Akun? Masuk
            </Link>
          }
          nativeButton={false}
        />
      </div>
    </main>
  );
}
