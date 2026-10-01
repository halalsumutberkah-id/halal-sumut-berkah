import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Syarat & Ketentuan',
  description: 'Syarat dan ketentuan penggunaan halalsumutberkah.id bagi UMKM, LPH, dan pengunjung Platform.',
  path: '/syarat-ketentuan',
});

export default function SyaratKetentuanPage() {
  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Legalitas</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">Syarat & Ketentuan</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <div>
            <p>
              Dengan mengakses dan menggunakan halalsumutberkah.id ("Platform"), anda menyetujui Syarat & Ketentuan berikut. Platform ini dikelola oleh Dinas Koperasi Kota Medan sebagai fasilitas resmi untuk mendukung proses sertifikasi
              halal UMKM di Sumatera Utara.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">1. Ketentuan Pendaftaran & Akun</h2>
            <ul className="ml-5 flex list-disc flex-col gap-1.5">
              <li>Pengguna wajib memberikan data yang benar, lengkap, dan dapat dipertanggungjawabkan saat mendaftar</li>
              <li>Pengguna bertanggung jawab penuh atas kerahasiaan kata sandi akunnya</li>
              <li>Setiap aktivitas yang dilakukan melalui akun pengguna menjadi tanggung jawab pemilik akun</li>
              <li>Platform berhak menolak atau menangguhkan akun yang terindikasi memberikan data palsu</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">2. Proses Sertifikasi Halal</h2>
            <p>
              Proses verifikasi dan sertifikasi halal dilakukan oleh Lembaga Pemeriksa Halal (LPH) mitra yang dipilih oleh UMKM. Platform berfungsi sebagai fasilitator dan tidak menerbitkan sertifikat halal secara langsung. Keputusan akhir
              mengenai kelulusan atau penolakan pengajuan sertifikasi berada pada kewenangan LPH terkait dan instansi berwenang sesuai peraturan perundang-undangan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">3. Konten dan Katalog Publik</h2>
            <p>
              Dengan menyetujui publikasi produk pada Katalog Produk Halal, pengguna memberikan izin kepada Platform untuk menampilkan informasi usaha dan produk secara publik. Pengguna menjamin bahwa seluruh informasi dan gambar yang
              diunggah adalah miliknya sendiri atau telah memperoleh izin yang sah untuk digunakan, dan tidak melanggar hak kekayaan intelektual pihak lain.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">4. Kewajiban Pengguna</h2>
            <ul className="ml-5 flex list-disc flex-col gap-1.5">
              <li>Tidak menyalahgunakan Platform untuk tujuan yang melanggar hukum</li>
              <li>Tidak mencoba mengakses sistem atau data pengguna lain tanpa izin</li>
              <li>Tidak mengunggah konten yang mengandung unsur SARA, kekerasan, atau melanggar peraturan perundang-undangan</li>
              <li>Menjaga kesopanan dan itikad baik dalam berinteraksi dengan LPH maupun admin Platform</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">5. Batasan Tanggung Jawab</h2>
            <p>
              Platform disediakan sebagaimana adanya ("as is"). Dinas Koperasi Kota Medan berupaya menjaga ketersediaan dan keakuratan layanan, namun tidak bertanggung jawab atas kerugian yang timbul akibat gangguan teknis, kesalahan data
              yang diinput oleh pengguna, atau keputusan bisnis yang diambil berdasarkan informasi pada Platform.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">6. Penangguhan dan Penghentian Akun</h2>
            <p>
              Platform berhak menangguhkan atau menghentikan akses akun yang terbukti melanggar Syarat & Ketentuan ini, memberikan data palsu, atau digunakan untuk tujuan yang merugikan pihak lain, tanpa pemberitahuan sebelumnya apabila
              diperlukan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">7. Perubahan Ketentuan</h2>
            <p>Syarat & Ketentuan ini dapat diperbarui sewaktu-waktu. Penggunaan Platform yang berkelanjutan setelah adanya perubahan dianggap sebagai persetujuan atas ketentuan yang telah diperbarui.</p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">8. Hukum yang Berlaku</h2>
            <p>Syarat & Ketentuan ini tunduk pada dan ditafsirkan sesuai dengan hukum yang berlaku di Republik Indonesia.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
