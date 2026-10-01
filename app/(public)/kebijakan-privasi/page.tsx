import { generateMetadata as buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Kebijakan Privasi',
  description: 'Kebijakan privasi halalsumutberkah.id mengenai pengumpulan, penggunaan, dan perlindungan data pengguna.',
  path: '/kebijakan-privasi',
});

export default function KebijakanPrivasiPage() {
  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Legalitas</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">Kebijakan Privasi</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <div>
            <p>
              halalsumutberkah.id ("Platform") dikelola oleh Dinas Koperasi Kota Medan sebagai bagian dari program fasilitasi sertifikasi halal bagi pelaku UMKM di Sumatera Utara. Kebijakan Privasi ini menjelaskan bagaimana kami
              mengumpulkan, menggunakan, menyimpan, dan melindungi data pribadi anda saat menggunakan Platform ini.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">1. Data yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan data yang anda berikan secara langsung saat mendaftar dan menggunakan Platform, meliputi:</p>
            <ul className="ml-5 flex list-disc flex-col gap-1.5">
              <li>Data identitas pemilik usaha (nama, nomor telepon, email)</li>
              <li>Data legalitas usaha (NIB, nomor sertifikat halal, dokumen sertifikat halal)</li>
              <li>Data usaha (nama usaha, alamat, deskripsi, produk yang dipasarkan)</li>
              <li>Kata sandi akun (disimpan dalam bentuk terenkripsi, tidak pernah dalam bentuk teks biasa)</li>
              <li>Data teknis seperti alamat IP dan aktivitas penggunaan, untuk keperluan keamanan sistem</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">2. Bagaimana Kami Menggunakan Data</h2>
            <p>Data yang kami kumpulkan digunakan untuk:</p>
            <ul className="ml-5 flex list-disc flex-col gap-1.5">
              <li>Memproses pengajuan dan verifikasi sertifikasi halal usaha anda</li>
              <li>Menghubungkan usaha anda dengan Lembaga Pemeriksa Halal (LPH) mitra</li>
              <li>Menampilkan profil usaha dan produk anda pada Katalog Produk Halal publik, sesuai persetujuan yang anda berikan saat pendaftaran</li>
              <li>Mengirimkan notifikasi terkait status pengajuan sertifikasi</li>
              <li>Menjaga keamanan dan mencegah penyalahgunaan Platform</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">3. Pembagian Data kepada Pihak Ketiga</h2>
            <p>
              Data usaha anda dibagikan kepada Lembaga Pemeriksa Halal (LPH) yang anda pilih, semata-mata untuk keperluan proses verifikasi dan sertifikasi halal. Kami tidak menjual atau membagikan data pribadi anda kepada pihak ketiga lain
              untuk tujuan komersial. Data dapat diungkapkan kepada instansi pemerintah terkait apabila diwajibkan oleh peraturan perundang-undangan yang berlaku.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">4. Keamanan Data</h2>
            <p>
              Kami menerapkan langkah-langkah teknis yang wajar untuk melindungi data anda, termasuk enkripsi kata sandi, pembatasan akses berbasis peran (role-based access), dan pemantauan terhadap potensi penyalahgunaan sistem. Meskipun
              demikian, tidak ada sistem yang sepenuhnya bebas dari risiko keamanan.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">5. Hak Pengguna</h2>
            <p>
              Anda berhak untuk mengakses, memperbarui, atau meminta koreksi atas data usaha anda kapan saja melalui halaman profil akun anda. Untuk permintaan penghapusan akun atau pertanyaan lain terkait data pribadi anda, silakan hubungi
              kami melalui kontak yang tercantum di bagian bawah halaman ini.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">6. Perubahan Kebijakan</h2>
            <p>Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diinformasikan melalui Platform, dan tanggal pembaruan terakhir akan tercantum di bagian atas halaman ini.</p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-foreground sm:text-xl">7. Kontak</h2>
            <p>Jika anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami melalui informasi kontak yang tersedia di bagian footer halaman ini.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
