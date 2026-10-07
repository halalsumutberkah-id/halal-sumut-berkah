// app/umkm/(dashboard)/dashboard/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ShieldCheck, ShieldQuestion, ArrowRight, Package, FileCheck2, Award, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/title-case';

interface Stats {
  businessName: string;
  totalProducts: number;
  publishedProducts: number;
  pendingVerification: number;
  rejectedProducts: number;
  sertifikasiGratisTotal?: number;
}

const WORKFLOW_STEPS = [
  'Lengkapi profil usaha anda.',
  'Tambahkan produk anda di menu Produk.',
  'Belum punya sertifikat halal? Ajukan Self Declare.',
  'Tunggu Admin memeriksa. Selama belum diperiksa, pengajuan masih bisa diubah atau dihapus.',
  'Setelah ada Pendamping, hubungi lewat tombol WhatsApp dan ikuti arahannya.',
  'Sertifikat terbit, produk anda tampil di katalog.',
];

async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/umkm/stats');
  if (!res.ok) throw new Error('Gagal memuat statistik');
  const data = await res.json();
  return data.data;
}

export default function UmkmDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['umkm', 'stats'],
    queryFn: fetchStats,
    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* GREETING */}
      <div>
        <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Selamat Datang, {toTitleCase(stats.businessName)}</h1>
        <p className="text-sm text-muted-foreground">Pilih layanan anda saat ini.</p>
      </div>

      {/* 2 KARTU PILIHAN LAYANAN */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
            <ShieldQuestion className="size-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-bold text-foreground">Belum Punya Sertifikat Halal</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Tambahkan produk terlebih dahulu, lalu ajukan Self Declare - Admin akan memverifikasi dan menugaskan LP3H untuk mendampingi anda.</p>
          </div>
          <Button
            render={
              <Link href="/umkm/sertifikasi-gratis">
                Ajukan Self Declare (Gratis)
                <ArrowRight className="size-4" />
              </Link>
            }
            nativeButton={false}
            className="mt-auto w-fit  bg-amber-600  hover:bg-amber-700"
          />
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-base font-bold text-foreground">Sudah Punya Sertifikat Halal</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">Tambahkan produk anda di E-Catalog, lengkapi nomor dan sertifikat halal, lalu publikasikan ke katalog publik.</p>
          </div>
          <Button
            render={
              <Link href="/umkm/products">
                Kelola E-Catalog
                <ArrowRight className="size-4" />
              </Link>
            }
            nativeButton={false}
            className="mt-auto w-fit"
          />
        </div>
      </div>

      {/* STATUS PENGAJUAN */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">Status Pengajuan Anda</h3>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a href="https://ptsp.halal.go.id/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
              <FileCheck2 className="size-5" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                Daftar Mandiri
                <ExternalLink className="size-3.5 text-muted-foreground" />
              </p>
              <p className="text-xs text-muted-foreground">Ajukan sertifikasi halal mandiri lewat situs resmi SIHALAL (BPJPH).</p>
            </div>
          </a>

          <Link href="/umkm/sertifikasi-gratis" className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Self Declare</p>
              <p className="text-xs text-muted-foreground">{!stats.sertifikasiGratisTotal ? 'Belum ada pengajuan' : `${stats.sertifikasiGratisTotal} pengajuan`}</p>
            </div>
          </Link>

          <Link href="/umkm/products" className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Produk E-Catalog</p>
              <p className="text-xs text-muted-foreground">
                {stats.publishedProducts} dari {stats.totalProducts} produk sudah dipublikasikan
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* ALUR PENGGUNAAN */}
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="text-sm font-semibold text-foreground">Cara Menggunakan</h3>

        <ol className="mt-4 flex flex-col gap-3">
          {WORKFLOW_STEPS.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">{index + 1}</span>
              <p className="text-sm leading-relaxed text-muted-foreground">{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
