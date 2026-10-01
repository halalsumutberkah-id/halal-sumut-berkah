import Link from 'next/link';
import Image from 'next/image';
import { Building2, MapPin, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toTitleCase } from '@/lib/title-case';

interface Lp3hItem {
  id: string;
  name: string;
  slug: string;
  address: string;
  logoUrl: string | null;
  _count: { pendampings: number };
}

interface Lp3hMitraSectionProps {
  lphList: Lp3hItem[];
  totalLph?: number;
}

function formatLp3hName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\blp3h\b/gi, 'LP3H').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

export function LphMitraSection({ lphList, totalLph = 0 }: Lp3hMitraSectionProps) {
  if (lphList.length === 0) return null;

  return (
    <section className="bg-blue-50 dark:bg-neutral-800">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Lembaga Resmi</span>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">LP3H & LPH Mitra</h2>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Pendampingan proses sertifikasi halal didukung oleh Lembaga Pendamping Proses Produk Halal (LP3H){totalLph > 0 ? ` dan ${totalLph} Lembaga Pemeriksa Halal (LPH)` : ''} resmi yang tersebar di wilayah Sumatera Utara.
            </p>

            <div>
              <Button
                variant="outline"
                render={
                  <Link href="/lp3h-sumut">
                    Lihat Semua Lembaga
                    <ArrowRight className="size-4" />
                  </Link>
                }
                nativeButton={false}
                className="h-auto w-fit rounded-full border-border bg-card px-6 py-3 font-medium text-foreground hover:bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-3">
            {lphList.map((item) => (
              <div key={item.id} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                <Link href={`/lp3h-sumut/${item.slug}`} className="flex flex-col gap-4">
                  <div className="flex size-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/60 text-blue-700 dark:text-blue-300">
                    {item.logoUrl ? <Image src={item.logoUrl} alt={item.name} width={56} height={56} className="size-full object-contain p-2" /> : <Building2 className="size-7" />}
                  </div>

                  <h3 className="line-clamp-2 text-base font-bold text-foreground hover:text-primary">{formatLp3hName(item.name)}</h3>
                </Link>

                <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-300">
                    <Users className="size-3.5 shrink-0" />
                    <span className="font-semibold">{item._count.pendampings} Pendamping</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    <span className="line-clamp-2">{toTitleCase(item.address)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
