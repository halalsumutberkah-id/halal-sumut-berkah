// components/public/sections/statistics-chart-section.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface TotalTrendPoint {
  period: string;
  certifiedCount: number;
}

interface KabupatenPoint {
  kabupaten: string;
  period: string;
  certifiedCount: number;
}

interface StatisticsResponse {
  totalTrend: TotalTrendPoint[];
  perKabupaten: KabupatenPoint[];
}

async function fetchStatistics(): Promise<StatisticsResponse> {
  const res = await fetch('/api/public/statistics');
  if (!res.ok) throw new Error('Gagal memuat data statistik');
  const data = await res.json();
  return data.data;
}

function formatPeriodLabel(period: string) {
  const [year, month] = period.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${months[Number(month) - 1]} ${year}`;
}

// tooltip custom biar konsisten sama design system (card putih, border,
// bukan tooltip default recharts yang polos)
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-md">
      <p className="font-semibold text-foreground">{label}</p>
      <p className="text-muted-foreground">{payload[0].value.toLocaleString('id-ID')} UMKM tersertifikasi</p>
    </div>
  );
}

export function StatisticsChartSection() {
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'statistics'],
    queryFn: fetchStatistics,
  });

  const totalTrend = (data?.totalTrend ?? []).map((point) => ({
    ...point,
    label: formatPeriodLabel(point.period),
  }));

  const perKabupaten = (data?.perKabupaten ?? []).slice(0, 10);

  const hasTrendData = totalTrend.length > 0;
  const hasKabupatenData = perKabupaten.length > 0;

  return (
    <section className="border-t border-border bg-muted/40 py-16">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-3">
          <div className="border-l-4 border-yellow-500 pl-4">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Data & Capaian</span>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Statistik Sertifikasi Halal</h2>
          </div>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">Perkembangan jumlah UMKM bersertifikat halal di Sumatera Utara dari waktu ke waktu.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">Tren Total Se-Sumatera Utara</h3>
            </div>

            <div className="mt-6 h-72">
              {isLoading ? (
                <div className="h-full w-full animate-pulse rounded-xl bg-muted" />
              ) : !hasTrendData ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Data belum tersedia</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={totalTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="certifiedCount" stroke="var(--primary)" strokeWidth={2.5} dot={{ fill: 'var(--primary)', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
                <BarChart3 className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-foreground">10 Wilayah Teratas</h3>
            </div>

            <div className="mt-6 h-72">
              {isLoading ? (
                <div className="h-full w-full animate-pulse rounded-xl bg-muted" />
              ) : !hasKabupatenData ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Data belum tersedia</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perKabupaten} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="kabupaten" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="certifiedCount" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
