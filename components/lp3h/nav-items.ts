// components/lp3h/nav-items.ts

import { LayoutDashboard, Users, Building2, Award } from 'lucide-react';
import type { NavItem } from '@/components/shared/sidebar-nav';

export const lp3hNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/lp3h/dashboard', icon: LayoutDashboard },
  { label: 'Profil Lembaga', href: '/lp3h/profile', icon: Building2 },
  { label: 'Pendamping (P3H)', href: '/lp3h/pendamping', icon: Users },
  { label: 'Sertifikasi Gratis', href: '/lp3h/sertifikasi-gratis', icon: Award },
];
