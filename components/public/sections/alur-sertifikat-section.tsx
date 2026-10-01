// components/public/sections/alur-sertifikat-section.tsx

import { UserPlus, Package, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
    title: 'Pilih Pendamping',
    description: 'Ajukan Sertifikasi Halal Gratis.',
  },
  {
    icon: ShieldCheck,
    number: 4,
    title: 'Bersertifikat Halal',
    description: 'Produk tampil di Katalog Halal.',
  },
];

const REASONS = ['Meningkatkan kepercayaan konsumen terhadap produk anda', 'Membuka akses pasar yang lebih luas, dalam dan luar daerah', 'Bagian dari kewajiban regulasi produk halal di Indonesia'];

export function AlurSertifikatSection() {
  return (
    <section className="flex h-full flex-col rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="border-l-4 border-yellow-500 pl-4">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Alur Sertifikat Halal</h2>
      </div>

      {/* grid 2x2 - urutan cukup ditunjukkan lewat nomor, tanpa perlu
          panah/scroll yang malah bikin sesak di kolom setengah lebar ini */}
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6">
        {STEPS.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="flex flex-col items-start gap-2 text-left">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                <Icon className="size-5" />
              </div>
              <span className="text-sm font-semibold text-foreground sm:text-base">
                {step.number}. {step.title}
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            </div>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="mt-8 rounded-xl bg-green-50 p-5 dark:bg-green-900/20">
        <h3 className="text-base font-bold text-green-700 dark:text-green-400 sm:text-lg">Kenapa Harus Sertifikasi Halal?</h3>

        <div className="mt-4 flex flex-col gap-3">
          {REASONS.map((reason) => (
            <div key={reason} className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400" />
              <p className="text-sm leading-relaxed text-green-900/80 dark:text-green-100/80">{reason}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
