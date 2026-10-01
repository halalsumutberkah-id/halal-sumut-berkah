import Image from 'next/image';
import { Target, Compass, ShieldCheck, HeartHandshake, Award, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { StatsSection } from '@/components/public/sections/stats-section';
import { StatisticsChartSection } from '@/components/public/sections/statistics-chart-section';

export const revalidate = 60;

export const metadata = buildMetadata({
  title: 'Tentang Kami',
  description: 'Mengenal platform Halal Sumut Berkah, katalog digital resmi produk UMKM bersertifikat halal di Sumatera Utara.',
  path: '/tentang-kami',
});

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Integritas & Kepatuhan',
    description: 'Memastikan seluruh proses verifikasi data dan keabsahan sertifikat halal berjalan sesuai regulasi BPJPH yang berlaku.',
  },
  {
    icon: HeartHandshake,
    title: 'Keberpihakan UMKM',
    description: 'Mendampingi pelaku usaha kecil dan mikro secara intensif dari pendaftaran hingga produk tampil resmi di katalog publik.',
  },
  {
    icon: Sparkles,
    title: 'Transparansi Layanan',
    description: 'Menyajikan proses alur pendaftaran, status verifikasi, dan data produk halal secara terbuka dan akuntabel.',
  },
  {
    icon: Award,
    title: 'Daya Saing Daerah',
    description: 'Mendorong produk unggulan Sumatera Utara memiliki nilai tambah tinggi untuk pasar lokal, nasional, hingga ekspor.',
  },
];

export default async function TentangKamiPage() {
  const totalUmkm = await prisma.umkmProfile.count();
  const totalProducts = await prisma.product.count({ where: { isPublished: true } });
  const totalLph = await prisma.lp3hProfile.count();

  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Profil Platform</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">Tentang Halal Sumut Berkah</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
              Gerakan terpadu dalam membangun ekosistem jaminan produk halal, memverifikasi usaha bersertifikat halal secara resmi, serta memperluas etalase pasar produk UMKM Sumatera Utara.
            </p>
          </div>
        </div>
      </section>

      <StatsSection totalUmkm={totalUmkm} totalProducts={totalProducts} totalLph={totalLph} />

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-5">
            <div className="flex flex-col gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Target className="size-6" />
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Arah & Tujuan</span>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">Visi Utama</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Menjadikan Sumatera Utara sebagai pusat pertumbuhan ekonomi syariah dan industri halal terdepan yang berdaya saing, inklusif, serta memberikan keberkahan bagi seluruh lapisan masyarakat.
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-border pt-6">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Didukung Oleh</span>
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:gap-6">
                <div className="flex items-center gap-3">
                  <Image src="/images/logo_sumutprov.png" alt="Pemerintah Provinsi Sumatera Utara" width={36} height={36} className="size-9 shrink-0 object-contain" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-foreground">Pemerintah Provinsi</span>
                    <span className="text-[11px] text-muted-foreground">Sumatera Utara</span>
                  </div>
                </div>

                <div className="h-px w-14 shrink-0 bg-border sm:h-8 sm:w-px" />

                <Image src="/images/logo-diskopukm-sumut.png" alt="Dinas Koperasi dan UKM Sumatera Utara" width={200} height={200} className="h-9 w-auto shrink-0 object-contain" />

                <div className="h-px w-14 shrink-0 bg-border sm:h-8 sm:w-px" />

                <Image src="/images/logo-bank-indonesia.png" alt="Bank Indonesia" width={260} height={260} className="h-11 w-auto shrink-0 object-contain" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8 lg:col-span-7">
            <div className="flex flex-col gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
                <Compass className="size-6" />
              </div>
              <div className="border-l-4 border-yellow-500 pl-3">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Langkah Strategis</span>
                <h2 className="text-xl font-bold text-foreground sm:text-2xl">Misi Kami</h2>
              </div>

              <ul className="mt-2 flex flex-col gap-3.5">
                <li className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                  <span>Mempercepat proses pendaftaran dan verifikasi tanpa biaya bagi ribuan UMKM bersertifikat halal di 33 Kabupaten/Kota se-Sumatera Utara.</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">2</span>
                  <span>Mengintegrasikan Lembaga Pemeriksa Halal (LPH) terakreditasi agar proses verifikasi keabsahan sertifikat dan data usaha berjalan cepat, tepat, dan transparan.</span>
                </li>
                <li className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">3</span>
                  <span>Membuka akses pasar yang lebih luas melalui katalog produk halal digital yang terkurasi dan dipercaya oleh konsumen domestik maupun global.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <StatisticsChartSection />

      <section className="border-t border-border bg-blue-50 py-16 dark:bg-neutral-800">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-3">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Prinsip Kerja</span>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Nilai & Komitmen Layanan</h2>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">Fondasi kami dalam melayani para pelaku usaha dan menjaga standar kehalalan setiap produk.</p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div key={val.title} className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-6" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <h3 className="text-base font-bold text-foreground">{val.title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{val.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
