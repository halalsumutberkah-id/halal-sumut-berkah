// components/umkm/umkm-header.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { PanelLeftClose, PanelLeftOpen, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/shared/mobile-nav';
import { NotificationBell } from '@/components/shared/notification-bell';
import { UserMenu } from '@/components/shared/user-menu';
import { umkmNavItems } from '@/components/umkm/nav-items';

interface UmkmHeaderProps {
  name: string;
  email: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

// queryKey SAMA dengan halaman profil/dashboard UMKM & sidebar desktop -
// cache ke-share, gak nambah fetch baru
async function fetchProfileSlug(): Promise<{ slug: string } | null> {
  const res = await fetch('/api/umkm/profile');
  if (!res.ok) return null;
  const data = await res.json();
  return data.data ?? null;
}

export function UmkmHeader({ name, email, collapsed, onToggleCollapsed }: UmkmHeaderProps) {
  const { data: profile } = useQuery({
    queryKey: ['umkm', 'profile'],
    queryFn: fetchProfileSlug,
    staleTime: 60 * 1000,
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav items={umkmNavItems} title="UMKM" loginPath="/umkm/login" />

        <Button variant="ghost" size="icon" onClick={onToggleCollapsed} className="hidden md:inline-flex" aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}>
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </Button>

        <span className="font-semibold md:hidden">UMKM</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {profile?.slug && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 md:hidden"
            render={
              <a href={`/profil-umkm/${profile.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" />
                <span>Profil Publik</span>
              </a>
            }
            nativeButton={false}
          />
        )}

        <NotificationBell />
        <UserMenu name={name} email={email} changePasswordHref="/umkm/settings/change-password" />
      </div>
    </header>
  );
}
