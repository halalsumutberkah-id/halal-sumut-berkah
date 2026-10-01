// components/admin/nav-items.ts

import { LayoutDashboard, Building2, Landmark, Tags, Briefcase, Store, Package, GraduationCap, Newspaper, BarChart3, Award, GalleryHorizontal, Users, Ticket } from 'lucide-react';
import type { NavEntry } from '@/components/shared/sidebar-nav';

export const adminNavItems: NavEntry[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  {
    label: 'Lembaga & Pendamping',
    icon: Building2,
    children: [
      { label: 'LP3H', href: '/admin/lp3h', icon: Building2 },
      { label: 'Pendamping (P3H)', href: '/admin/pendamping', icon: Users },
      { label: 'LPH', href: '/admin/lph-entity', icon: Landmark },
    ],
  },
  {
    label: 'UMKM & Sertifikasi',
    icon: Store,
    children: [
      { label: 'UMKM', href: '/admin/umkm', icon: Store },
      { label: 'Verifikasi Produk', href: '/admin/products', icon: Package },
      // "Daftar Mandiri" (fitur lama) sementara dimatikan dari navlink -
      // konsepnya tumpang tindih sama situs resmi SIHALAL, tidak dipakai
      // buat sekarang. Halaman & API-nya TETAP ada, cuma link navigasinya
      // yang dilepas
      { label: 'Self Declare', href: '/admin/sertifikasi-gratis', icon: Award },
      { label: 'Kode Fasilitasi', href: '/admin/fasilitasi-code', icon: Ticket },
    ],
  },
  {
    label: 'Master Data',
    icon: Tags,
    children: [
      { label: 'Kategori Produk', href: '/admin/categories', icon: Tags },
      { label: 'Kategori Usaha', href: '/admin/business-categories', icon: Briefcase },
    ],
  },
  {
    label: 'Konten',
    icon: Newspaper,
    children: [
      { label: 'Banner Promosi', href: '/admin/banners', icon: GalleryHorizontal },
      { label: 'Edukasi', href: '/admin/education', icon: GraduationCap },
      { label: 'Berita & Kegiatan', href: '/admin/news', icon: Newspaper },
    ],
  },
  { label: 'Statistik', href: '/admin/statistics', icon: BarChart3 },
];
