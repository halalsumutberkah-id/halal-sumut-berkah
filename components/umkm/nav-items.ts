// components/umkm/nav-items.ts

import { LayoutDashboard, Store, Package, Award } from 'lucide-react';
import type { NavItem } from '@/components/shared/sidebar-nav';

export const umkmNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/umkm/dashboard', icon: LayoutDashboard },
  { label: 'Profil Usaha', href: '/umkm/profile', icon: Store },
  { label: 'E-Catalog', href: '/umkm/products', icon: Package },
  // "Daftar Mandiri" (fitur lama) sementara dimatikan dari navlink -
  // konsepnya ternyata tumpang tindih sama situs resmi SIHALAL, tidak
  // dipakai buat sekarang. Halaman & API-nya TETAP ada, cuma link
  // navigasinya yang dilepas
  { label: 'Self Declare', href: '/umkm/sertifikasi-gratis', icon: Award },
];
