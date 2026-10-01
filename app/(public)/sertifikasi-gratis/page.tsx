import Link from 'next/link';
import { CheckCircle2, UserPlus, ClipboardList, ShieldCheck, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Self Declare',
  description: 'Panduan syarat dan alur pengajuan Self Declare untuk pelaku UMKM di Sumatera Utara.',
  path: '/sertifikasi-gratis',
});

const REQUIREMENTS = ['Memiliki akun terdaftar di sistem.', 'Memiliki NIB (Nomor Induk Berusaha).', 'Mengunggah foto KTP & Dokumen NIB.', 'Mengisi formulir data usaha, bahan baku, dan alur produksi.'];

const PROCEDURES = [
  {
    icon: UserPlus,
    title: 'Daftar Akun UMKM',
    description: 'Buat akun baru atau login ke dashboard UMKM Anda.',
  },
  {
    icon: ClipboardList,
    title: 'Isi Form & Produk',
    description: 'Lengkapi data usaha, masukkan rincian produk, lalu pilih "Ajukan Halal Gratis".',
  },
  {
    icon: ShieldCheck,
    title: 'Verifikasi Berkas',
    description: 'Tim Admin Dinas Koperasi & UKM Provsu memeriksa kelengkapan berkas Anda.',
  },
  {
    icon: Users,
    title: 'Pendampingan & Proses Sertifikat',
    description: 'Setelah berkas disetujui, Tim Admin akan menugaskan Pendamping (LP3H) dan menghubungi Anda untuk alur proses pembuatan Sertifikat Halal.',
  },
];

export default function SertifikasiGratisPage() {
  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-3xl">
              <div className="border-l-4 border-yellow-500 pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Panduan Pengajuan</span>
                <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">Self Declare</h1>
              </div>
              <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Program pendampingan sertifikasi halal tanpa biaya bagi UMKM di Sumatera Utara, dari pengajuan hingga terbitnya Sertifikat Halal resmi.</p>
            </div>

            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row md:flex-col lg:flex-row">
              <Button
                render={
                  <Link href="/umkm/register">
                    Daftar Sekarang
                    <ArrowRight className="size-4" />
                  </Link>
                }
                nativeButton={false}
                className="h-auto w-full justify-center rounded-full bg-yellow-500 px-6 py-3 font-semibold text-neutral-900 shadow-md hover:bg-yellow-400 sm:w-auto"
              />
              <Button
                variant="outline"
                render={<Link href="/umkm/login">Masuk Akun</Link>}
                nativeButton={false}
                className="h-auto w-full justify-center rounded-full border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 font-medium text-primary-foreground hover:bg-primary-foreground hover:text-primary sm:w-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="top-36 flex flex-col gap-3 lg:sticky">
              <div className="border-l-4 border-yellow-500 pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Persyaratan</span>
                <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Syarat Pengajuan</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">Pastikan hal-hal berikut sudah Anda siapkan sebelum mengajukan Self Declare.</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {REQUIREMENTS.map((item, i) => (
                  <li key={item} className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>
                      <span className="font-semibold text-foreground">{i + 1}.</span> {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-3">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Tahapan Pengajuan</span>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Alur Self Declare</h2>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">Rangkaian tahapan dari pengajuan hingga produk Anda resmi bersertifikat halal.</p>
          </div>

          <div className="mt-12 flex flex-col gap-4">
            {PROCEDURES.map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
                    <Icon className="size-6" />
                  </div>

                  <div className="h-px w-full bg-border sm:h-12 sm:w-px" />

                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="text-base font-bold text-foreground sm:text-lg">
                      {i + 1}. {item.title}
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{item.description}</p>
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
