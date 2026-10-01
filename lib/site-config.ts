export const siteConfig = {
  name: 'halalsumutberkah.id',
  title: 'Halal Sumut Berkah — Sertifikasi Halal UMKM Sumatera Utara',
  description: 'Platform digital resmi Dinas Koperasi Kota Medan yang menjembatani UMKM dengan Lembaga Pemeriksa Halal (LPH) untuk proses sertifikasi halal, serta katalog produk halal Sumatera Utara.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://halalsumutberkah.id',
  logo: '/images/logo_sumutprov.png', // logo Pemprov Sumut, dipakai buat og:image, twitter card, dan icon
  keywords: [
    // istilah umum sertifikasi halal
    'sertifikasi halal',
    'sertifikat halal',
    'label halal',
    'logo halal',
    'cara mendapatkan sertifikat halal',
    'syarat sertifikasi halal',
    'daftar sertifikasi halal online',
    'pendampingan sertifikasi halal gratis',
    'daftar mandiri halal',

    // regional - sumatera utara & medan
    'halal sumut',
    'halal sumatera utara',
    'umkm halal sumut',
    'umkm sumatera utara',
    'umkm medan',
    'produk halal medan',
    'produk halal sumut',
    'kuliner halal medan',
    'umkm binjai',
    'umkm deli serdang',
    'umkm pematangsiantar',
    'umkm tebing tinggi',

    // institusi & lembaga
    'BPJPH',
    'SIHALAL',
    'lembaga pemeriksa halal',
    'LPH sumatera utara',
    'dinas koperasi kota medan',
    'dinas koperasi sumatera utara',
    'pemerintah provinsi sumatera utara',

    // produk & katalog
    'katalog produk halal',
    'direktori umkm halal',
    'produk halal terverifikasi',
    'sertifikat halal umkm',
  ],
  locale: 'id_ID',
  themeColor: '#1D7A9C',
  authors: [{ name: 'Dinas Koperasi Kota Medan' }],
  creator: 'Dinas Koperasi Kota Medan',
  twitterHandle: '@halalsumutberkah',
} as const;
