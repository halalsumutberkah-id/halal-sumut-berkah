import { FileEdit, Building2, ClipboardCheck, Store } from 'lucide-react';

const STEPS = [
  {
    icon: FileEdit,
    title: 'Daftar & Unggah Sertifikat',
    description: 'Isi data usaha dan produk, lalu unggah nomor dan dokumen sertifikat halal yang sudah anda miliki.',
  },
  {
    icon: Building2,
    title: 'Pilih LPH',
    description: 'Pilih Lembaga Pemeriksa Halal (LPH) mitra yang akan memverifikasi data usaha anda.',
  },
  {
    icon: ClipboardCheck,
    title: 'Verifikasi Data',
    description: 'LPH memeriksa keabsahan sertifikat dan kelengkapan data yang anda ajukan.',
  },
  {
    icon: Store,
    title: 'Tampil di Katalog',
    description: 'Setelah terverifikasi, produk anda tampil resmi di Katalog Halal Sumatera Utara.',
  },
];

export function HowItWorksSection() {
  return (
    <section className="bg-blue-50 dark:bg-neutral-800">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Alur Pendaftaran</span>
            <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Cara Kerja</h2>
          </div>
          <p className="max-w-md text-sm text-muted-foreground sm:text-base">Empat langkah sederhana untuk mendaftarkan usaha bersertifikat halal anda ke katalog resmi.</p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;

            return (
              <div key={step.title} className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-6">
                <div className="absolute inset-x-0 top-0 h-1 bg-yellow-500" />

                <span className="pointer-events-none absolute right-4 top-2 text-6xl font-black text-foreground/4">0{index + 1}</span>

                <div className="flex flex-col gap-5">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
                    <Icon className="size-6" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Langkah 0{index + 1}</span>
                    <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
