// components/umkm/umkm-sidebar.tsx

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { SidebarNav } from '@/components/shared/sidebar-nav';
import { LogoutButton } from '@/components/shared/logout-button';
import { umkmNavItems } from '@/components/umkm/nav-items';
import { cn } from '@/lib/utils';

interface UmkmSidebarProps {
  collapsed: boolean;
}

// queryKey SAMA dengan yang dipakai di halaman profil/dashboard UMKM -
// cache ke-share, gak nambah fetch baru kalau udah pernah di-load
async function fetchProfileSlug(): Promise<{ slug: string } | null> {
  const res = await fetch('/api/umkm/profile');
  if (!res.ok) return null;
  const data = await res.json();
  return data.data ?? null;
}

export function UmkmSidebar({ collapsed }: UmkmSidebarProps) {
  const { data: profile } = useQuery({
    queryKey: ['umkm', 'profile'],
    queryFn: fetchProfileSlug,
    staleTime: 60 * 1000,
  });

  return (
    <aside className={cn('hidden md:flex md:flex-col md:sticky md:top-0 md:h-screen md:border-r md:bg-card transition-[width] duration-200', collapsed ? 'md:w-16' : 'md:w-64')}>
      <div className={cn('flex h-16 items-center border-b', collapsed ? 'justify-center px-2' : 'gap-2 px-4')}>
        <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={64} height={64} className={cn('w-auto shrink-0 transition-all duration-200', collapsed ? 'h-8' : 'h-14')} />
        {!collapsed && (
          <Link href="/umkm/dashboard" className="truncate font-semibold">
            UMKM
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <SidebarNav items={umkmNavItems} collapsed={collapsed} />
      </div>

      {profile?.slug && (
        <div className={cn('border-t p-3', collapsed && 'flex justify-center')}>
          <a
            href={`/profil-umkm/${profile.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Lihat Profil Publik Saya"
            className={cn('flex items-center gap-2 rounded-md text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground', collapsed ? 'size-9 justify-center' : 'w-full px-2.5 py-2')}
          >
            <ExternalLink className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">Lihat Profil Publik</span>}
          </a>
        </div>
      )}

      <div className="border-t p-3">
        <LogoutButton loginPath="/umkm/login" collapsed={collapsed} />
      </div>
    </aside>
  );
}
