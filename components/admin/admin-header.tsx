// components/admin/admin-header.tsx

'use client';

import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileNav } from '@/components/shared/mobile-nav';
import { NotificationBell } from '@/components/shared/notification-bell';
import { UserMenu } from '@/components/shared/user-menu';
import { adminNavItems } from '@/components/admin/nav-items';

interface AdminHeaderProps {
  name: string;
  email: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

export function AdminHeader({ name, email, collapsed, onToggleCollapsed }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav items={adminNavItems} title="Super Admin" loginPath="/admin/login" />

        <Button variant="ghost" size="icon" onClick={onToggleCollapsed} className="hidden md:inline-flex" aria-label={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}>
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </Button>

        <span className="font-semibold md:hidden">Super Admin</span>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserMenu name={name} email={email} changePasswordHref="/admin/settings/change-password" />
      </div>
    </header>
  );
}
