import { FileText, CheckCircle2, UserPlus, Package, ShieldCheck, Users, GalleryHorizontal } from 'lucide-react';
import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Syarat & Prosedur Pendaftaran',
  description: 'Panduan lengkap persyaratan berkas dan alur prosedur pendaftaran usaha bersertifikat halal untuk pelaku UMKM di Sumatera Utara.',
  path: '/syarat-prosedur',
});

const REQUIREMENTS = [
  {
    category: 'Data Pelaku Usaha',
    items: ['Nomor Induk Kependudukan (NIK)', 'Foto/scan KTP', 'Nomor WhatsApp aktif', 'Tanggal lahir', 'Alamat lengkap (kecamatan, kabupaten/kota)'],
  },
  {
    category: 'Data Usaha',
    items: ['Nomor Induk Berusaha (NIB) yang masih aktif beserta filenya', 'Logo usaha (format gambar)', 'Alamat usaha lengkap', 'Bentuk dan kategori usaha', 'Nomor kontak usaha untuk ditampilkan publik'],
  },
  {
    category: 'Data Produk',
    items: ['Foto produk', 'Nama, harga, dan deskripsi singkat produk', 'Nomor dan file sertifikat halal (bila sudah dimiliki)', 'Izin edar lain seperti PIRT/BPOM/HAKI/SLHS (bila ada)'],
  },
];

const PROCEDURES = [
  {
    icon: UserPlus,
    title: 'Daftar Akun UMKM',
    description: 'Buat akun secara gratis dengan melengkapi data pelaku usaha dan data usaha anda.',
  },
  {
    icon: Package,
    title: 'Tambahkan Produk',
    description: 'Lengkapi data produk usaha anda di menu E-Catalog pada dashboard UMKM.',
  },
  {
    icon: Users,
    title: 'Ajukan Self Declare (bila belum bersertifikat)',
    description: 'Bagi produk yang belum memiliki sertifikat halal, ajukan Self Declare. Admin akan memverifikasi berkas dan menugaskan LP3H beserta Pendamping resmi untuk membantu proses hingga terbit sertifikat.',
  },
  {
    icon: ShieldCheck,
    title: 'Verifikasi oleh Admin',
    description: 'Admin memeriksa kelengkapan dan keabsahan data produk beserta sertifikat halal yang telah diunggah.',
  },
  {
    icon: GalleryHorizontal,
    title: 'Publikasikan ke Katalog',
    description: 'Produk yang telah terverifikasi dapat dipublikasikan dan akan tampil resmi di Katalog Halal Sumut Berkah untuk memperluas jangkauan pasar.',
  },
];

export default function SyaratProsedurPage() {
  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Panduan Pendaftaran</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">Syarat & Prosedur</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Panduan terpadu kelengkapan berkas administratif dan alur verifikasi pendaftaran usaha bersertifikat halal bagi UMKM di Sumatera Utara.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="top-36 flex flex-col gap-3 lg:sticky">
              <div className="border-l-4 border-yellow-500 pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Dokumen Wajib</span>
                <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Persyaratan Berkas</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Siapkan dokumen berikut dalam format digital (gambar/PDF) sebelum mendaftarkan usaha anda. Anda tidak perlu sudah memiliki sertifikat halal untuk mendaftar — data ini bisa dilengkapi kemudian lewat Self Declare.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-8">
            {REQUIREMENTS.map((group) => (
              <div key={group.category} className="overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground sm:text-lg">{group.category}</h3>
                </div>

                <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-3">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Tahapan Pendaftaran</span>
              <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Alur Prosedur Pendaftaran</h2>
            </div>
            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">Rangkaian tahapan hingga produk usaha anda tampil resmi di katalog publik.</p>
          </div>

          <div className="mt-12 flex flex-col gap-4">
            {PROCEDURES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:gap-6 sm:p-7">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-yellow-50 text-yellow-700 dark:bg-neutral-800 dark:text-yellow-500">
                    <Icon className="size-6" />
                  </div>

                  <div className="h-px w-full bg-border sm:h-12 sm:w-px" />

                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="text-base font-bold text-foreground sm:text-lg">{item.title}</h3>
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
