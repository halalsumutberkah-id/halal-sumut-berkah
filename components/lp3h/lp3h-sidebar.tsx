'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SidebarNav } from '@/components/shared/sidebar-nav';
import { LogoutButton } from '@/components/shared/logout-button';
import { lp3hNavItems } from '@/components/lp3h/nav-items';
import { cn } from '@/lib/utils';

interface Lp3hSidebarProps {
  collapsed: boolean;
}

export function Lp3hSidebar({ collapsed }: Lp3hSidebarProps) {
  return (
    <aside className={cn('hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:border-r md:bg-card transition-[width] duration-200', collapsed ? 'md:w-16' : 'md:w-64')}>
      <div className={cn('flex h-16 items-center border-b', collapsed ? 'justify-center px-2' : 'gap-2 px-4')}>
        <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={64} height={64} className={cn('w-auto shrink-0 transition-all duration-200', collapsed ? 'h-8' : 'h-14')} />
        {!collapsed && (
          <Link href="/lp3h/dashboard" className="truncate font-semibold">
            LP3H
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav items={lp3hNavItems} collapsed={collapsed} />
      </div>

      <div className="border-t p-3">
        <LogoutButton loginPath="/lp3h/login" collapsed={collapsed} />
      </div>
    </aside>
  );
}
