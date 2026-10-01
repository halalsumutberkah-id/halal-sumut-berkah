// app/admin/(dashboard)/dashboard/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Store, Building2, Landmark, Package, Clock, CheckCircle2, XCircle, GraduationCap, Newspaper, Award, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/admin/dashboard/stat-card';

interface Stats {
  totalUmkm: number;
  totalLp3h: number;
  totalLph: number;
  totalProducts: number;
  publishedProducts: number;
  pendingVerification: number;
  rejectedProducts: number;
  totalEducation: number;
  totalNews: number;
  pendingSertifikasiGratis: number;
}

async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/admin/stats');
  if (!res.ok) throw new Error('Gagal memuat statistik');
  const data = await res.json();
  return data.data;
}

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: fetchStats,
    staleTime: 60 * 1000,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard Super Admin</h1>
        <p className="text-sm text-muted-foreground">Ringkasan aktivitas platform halalsumutberkah.id.</p>
      </div>

      {!isLoading && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Package className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Verifikasi Produk</p>
              <p className="text-xs text-muted-foreground">{stats.pendingVerification} produk menunggu verifikasi</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href="/admin/products">
                  Lihat Sekarang
                  <ArrowRight className="size-3.5" />
                </Link>
              }
              nativeButton={false}
              className="mt-auto w-fit"
            />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Award className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Self Declare</p>
              <p className="text-xs text-muted-foreground">{stats.pendingSertifikasiGratis} pengajuan menunggu verifikasi</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              render={
                <Link href="/admin/sertifikasi-gratis">
                  Lihat Sekarang
                  <ArrowRight className="size-3.5" />
                </Link>
              }
              nativeButton={false}
              className="mt-auto w-fit"
            />
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && stats && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Ringkasan Umum</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total UMKM Terdaftar" value={stats.totalUmkm} icon={Store} />
              <StatCard label="Total LP3H" value={stats.totalLp3h} icon={Building2} />
              <StatCard label="Total LPH" value={stats.totalLph} icon={Landmark} />
              <StatCard label="Total Produk" value={stats.totalProducts} icon={Package} />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Status Verifikasi Produk</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Menunggu Verifikasi" value={stats.pendingVerification} icon={Clock} className="bg-warning/15 text-warning" />
              <StatCard label="Sudah Dipublikasikan" value={stats.publishedProducts} icon={CheckCircle2} className="bg-success/15 text-success" />
              <StatCard label="Ditolak" value={stats.rejectedProducts} icon={XCircle} className="bg-destructive/15 text-destructive" />
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Konten Publik</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Artikel Edukasi Terbit" value={stats.totalEducation} icon={GraduationCap} />
              <StatCard label="Berita Terbit" value={stats.totalNews} icon={Newspaper} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
