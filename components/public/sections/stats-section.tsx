import { User, FileCheck, Building2, MapPin } from 'lucide-react';

interface StatsSectionProps {
  totalUmkm: number;
  totalProducts: number;
  totalLph: number;
}

const TOTAL_REGENCIES_SUMUT = 33;

export function StatsSection({ totalUmkm, totalProducts, totalLph }: StatsSectionProps) {
  const stats = [
    { icon: User, value: totalUmkm, label: 'UMKM Terdaftar' },
    { icon: FileCheck, value: totalProducts, label: 'Produk Bersertifikat Halal' },
    { icon: Building2, value: totalLph, label: 'LP3H Mitra' },
    { icon: MapPin, value: TOTAL_REGENCIES_SUMUT, label: 'Kab/Kota di Sumatera Utara' },
  ];

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex w-full flex-col rounded-2xl bg-primary p-6  divide-primary-foreground/20 lg:flex-row lg:items-center lg:p-8 lg:divide-x">
        <div className="pb-6 lg:w-1/4 lg:pb-0 lg:pr-8">
          <div className="border-l-4 border-yellow-500 pl-4">
            <h2 className="text-xl font-bold leading-tight text-primary-foreground sm:text-2xl">Bersama Membangun Ekosistem Halal Sumatera Utara</h2>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-y-5 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-8 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-primary-foreground/20">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-4 lg:px-6">
                <div className="flex size-13 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground">
                  <Icon className="size-6" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">{stat.value.toLocaleString('id-ID')}+</span>
                  <span className="text-xs font-medium text-primary-foreground/80 sm:text-sm">{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
