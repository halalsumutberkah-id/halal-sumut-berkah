// app/lp3h/(dashboard)/dashboard/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Users, Clock, Loader2, CheckCircle2, XCircle, AlertTriangle, ArrowRight, UserPlus, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/admin/dashboard/stat-card';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';

interface PendampingStat {
  pendampingId: string;
  pendampingName: string;
  totalDipilih: number;
}

interface RecentSubmission {
  id: string;
  status: string;
  createdAt: string;
  product: { name: string; umkm: { businessName: string } };
  pendamping: { name: string } | null;
}

interface Stats {
  totalPendamping: number;
  belumDiproses: number;
  sedangDiproses: number;
  selesai: number;
  ditolak: number;
  pendampingStats: PendampingStat[];
  recentSubmissions: RecentSubmission[];
}

const STATUS_LABELS: Record<string, string> = {
  belum_diproses: 'Belum Diproses',
  sedang_diproses: 'Sedang Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const STATUS_VARIANTS: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  belum_diproses: 'secondary',
  sedang_diproses: 'default',
  selesai: 'outline',
  ditolak: 'destructive',
};

async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/lp3h/stats');
  if (!res.ok) throw new Error('Gagal memuat statistik');
  const data = await res.json();
  return data.data;
}

interface ProfileCompleteness {
  jenisLembaga: string | null;
  lembagaInduk: string | null;
  officeKecamatan: string | null;
  officeKabupaten: string | null;
  officeAddress: string | null;
  contactEmail: string | null;
}

async function fetchProfileForCompleteness(): Promise<ProfileCompleteness> {
  const res = await fetch('/api/lp3h/profile');
  const data = await res.json();
  return data.data;
}

function isProfileComplete(profile?: ProfileCompleteness) {
  if (!profile) return false;
  return !!(profile.jenisLembaga && profile.lembagaInduk && profile.officeKecamatan && profile.officeKabupaten && profile.officeAddress && profile.contactEmail);
}

export default function Lp3hDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['lp3h', 'stats'],
    queryFn: fetchStats,
    // dashboard biasanya halaman yang paling sering dibuka ulang - stats
    // gak perlu selalu real-time, cukup dianggap fresh 1 menit
    staleTime: 60 * 1000,
  });

  // queryKey SAMA dengan yang dipakai di halaman /lp3h/profile - kalau
  // salah satu halaman sudah fetch & masih fresh, halaman satunya pakai
  // cache yang sama tanpa fetch ulang
  const { data: profile } = useQuery({
    queryKey: ['lp3h', 'profile'],
    queryFn: fetchProfileForCompleteness,
    staleTime: 60 * 1000,
  });

  const profileComplete = isProfileComplete(profile);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Dashboard LP3H</h1>
        <p className="text-sm text-muted-foreground">Ringkasan Pendamping, pengajuan Daftar Mandiri, dan tugas Sertifikasi Gratis yang masuk ke lembaga anda.</p>
      </div>

      {profile && !profileComplete && (
        <div className="flex flex-col gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-700 dark:text-yellow-500" />
            <div>
              <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">Lengkapi profil lembaga anda terlebih dahulu</p>
              <p className="text-sm text-yellow-800/80 dark:text-yellow-400/80">Menu "Tambah Pendamping" baru bisa diakses setelah profil lembaga lengkap.</p>
            </div>
          </div>
          <Button
            render={
              <Link href="/lp3h/profile">
                Lengkapi Profil
                <ArrowRight className="size-4" />
              </Link>
            }
            nativeButton={false}
            className="w-fit shrink-0 bg-yellow-600 hover:bg-yellow-700"
          />
        </div>
      )}

      {profile && profileComplete && (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Aksi Cepat</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <UserPlus className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Tambah Pendamping</p>
                <p className="text-xs text-muted-foreground">Daftarkan Pendamping baru untuk lembaga anda.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link href="/lp3h/pendamping">
                    Kelola Pendamping
                    <ArrowRight className="size-3.5" />
                  </Link>
                }
                nativeButton={false}
                className="mt-auto w-fit"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
                <Award className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Sertifikasi Gratis</p>
                <p className="text-xs text-muted-foreground">Lihat tugas pendampingan yang ditugaskan Admin.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                render={
                  <Link href="/lp3h/sertifikasi-gratis">
                    Lihat Tugas
                    <ArrowRight className="size-3.5" />
                  </Link>
                }
                nativeButton={false}
                className="mt-auto w-fit"
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!isLoading && stats && (
        <>
          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Statistik Daftar Mandiri</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <StatCard label="Total Pendamping" value={stats.totalPendamping} icon={Users} />
              <StatCard label="Belum Diproses" value={stats.belumDiproses} icon={Clock} className="bg-warning/15 text-warning" />
              <StatCard label="Sedang Diproses" value={stats.sedangDiproses} icon={Loader2} className="bg-primary/15 text-primary" />
              <StatCard label="Selesai" value={stats.selesai} icon={CheckCircle2} className="bg-success/15 text-success" />
              <StatCard label="Ditolak" value={stats.ditolak} icon={XCircle} className="bg-destructive/15 text-destructive" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Pengajuan Daftar Mandiri per Pendamping</h2>
              {stats.pendampingStats.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada data Pendamping.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {stats.pendampingStats.map((p) => (
                    <div key={p.pendampingId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="font-medium">{toTitleCase(p.pendampingName)}</span>
                      <Badge variant="secondary">{p.totalDipilih}x dipilih</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-5">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Pengajuan Daftar Mandiri Terbaru</h2>
              {stats.recentSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">Belum ada pengajuan masuk.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {stats.recentSubmissions.map((s) => (
                    <div key={s.id} className="flex flex-col gap-1 border-b pb-3 text-sm last:border-0 last:pb-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{toTitleCase(s.product.umkm.businessName)}</span>
                        <Badge variant={STATUS_VARIANTS[s.status] ?? 'secondary'} className="text-[10px]">
                          {STATUS_LABELS[s.status] ?? s.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Produk: {toTitleCase(s.product.name)} &middot; Pendamping: {s.pendamping ? toTitleCase(s.pendamping.name) : '-'}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(s.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
