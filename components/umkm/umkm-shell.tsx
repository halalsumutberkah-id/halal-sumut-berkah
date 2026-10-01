// components/umkm/umkm-shell.tsx

'use client';

import { useEffect, useState } from 'react';
import { UmkmSidebar } from '@/components/umkm/umkm-sidebar';
import { UmkmHeader } from '@/components/umkm/umkm-header';

const STORAGE_KEY = 'umkm-sidebar-collapsed';

interface UmkmShellProps {
  name: string;
  email: string;
  children: React.ReactNode;
}

export function UmkmShell({ name, email, children }: UmkmShellProps) {
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

  if (!isMounted) return null;

  return (
    <div className="flex min-h-screen">
      <UmkmSidebar collapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <UmkmHeader name={name} email={email} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
