// components/admin/admin-shell.tsx

'use client';

import { useEffect, useState } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';

const STORAGE_KEY = 'admin-sidebar-collapsed';

interface AdminShellProps {
  name: string;
  email: string;
  children: React.ReactNode;
}

export function AdminShell({ name, email, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setCollapsed(stored === 'true');
    setIsMounted(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }

  // hindari flash mismatch antara state default dan localStorage saat hydration
  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar collapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader name={name} email={email} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
