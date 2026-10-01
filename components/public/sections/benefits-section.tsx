import { Users, TrendingUp, Award, Handshake } from 'lucide-react';

const BENEFITS = [
  {
    icon: Users,
    title: 'Kepercayaan Konsumen',
    description: 'Status sertifikasi yang terverifikasi resmi meningkatkan kepercayaan pembeli terhadap produk anda.',
  },
  {
    icon: TrendingUp,
    title: 'Akses Pasar Lebih Luas',
    description: 'Terdaftar di katalog resmi membuat produk anda lebih mudah ditemukan pembeli di seluruh Sumatera Utara.',
  },
  {
    icon: Award,
    title: 'Kredibilitas Terverifikasi',
    description: 'Data usaha dan sertifikat anda diverifikasi langsung oleh LPH resmi, bukan sekadar klaim sepihak.',
  },
  {
    icon: Handshake,
    title: 'Pendaftaran Tanpa Biaya',
    description: 'Layanan pendaftaran dan verifikasi melalui platform ini tidak dipungut biaya tambahan.',
  },
];

export function BenefitsSection() {
  const [featuredBenefit, ...otherBenefits] = BENEFITS;
  const FeaturedIcon = featuredBenefit.icon;

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col justify-between gap-6 lg:col-span-5">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Keunggulan Program</span>
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">Kenapa Perlu Terdaftar di Katalog Ini?</h2>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">Terdaftar di katalog resmi bukan cuma soal terlihat, tapi soal kredibilitas dan jangkauan pasar usaha anda.</p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-blue-50 p-6 dark:bg-card">
            <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-500 text-neutral-800">
              <FeaturedIcon className="size-6" />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-semibold text-foreground">{featuredBenefit.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{featuredBenefit.description}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1">
          {otherBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  <Icon className="size-6" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-base font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
