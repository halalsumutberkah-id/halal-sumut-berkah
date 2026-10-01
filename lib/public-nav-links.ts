export interface NavChildLink {
  label: string;
  href?: string;
  external?: boolean;
  children?: NavChildLink[];
}

export interface PublicNavLink {
  label: string;
  href?: string;
  children?: NavChildLink[];
}

export const PUBLIC_NAV_LINKS: PublicNavLink[] = [
  { label: 'Beranda', href: '/' },
  {
    label: 'Daftar Sertifikasi Halal',
    children: [
      {
        label: 'Daftar Mandiri',
        href: 'https://ptsp.halal.go.id/',
        external: true,
      },
      {
        label: 'Sertifikat Gratis',
        children: [
          {
            label: 'Self Declare',
            href: '/sertifikasi-gratis',
          },
          {
            label: 'Reguler',
            href: '/regular',
          },
        ],
      },
      { label: 'Syarat dan Prosedur', href: '/syarat-prosedur' },
    ],
  },
  {
    label: 'Lembaga Halal',
    children: [
      { label: 'LP3H Sumatera Utara', href: '/lp3h-sumut' },
      { label: 'LPH Sumatera Utara', href: '/lph-sumut' },
    ],
  },
  { label: 'Produk Halal', href: '/produk-halal' },
  {
    label: 'Informasi',
    children: [
      { label: 'Edukasi', href: '/edukasi' },
      { label: 'Berita dan Kegiatan', href: '/berita' },
      { label: 'Tentang Kami', href: '/tentang-kami' },
    ],
  },
];

export const FOOTER_MENU_LINKS: { label: string; href: string }[] = [
  { label: 'Beranda', href: '/' },
  { label: 'Syarat dan Prosedur', href: '/syarat-prosedur' },
  { label: 'LP3H Sumatera Utara', href: '/lp3h-sumut' },
  { label: 'LPH Sumatera Utara', href: '/lph-sumut' },
  { label: 'Produk Halal', href: '/produk-halal' },
  { label: 'Edukasi', href: '/edukasi' },
  { label: 'Berita dan Kegiatan', href: '/berita' },
  { label: 'Tentang Kami', href: '/tentang-kami' },
];
