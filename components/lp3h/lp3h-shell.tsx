// components/lp3h/lp3h-shell.tsx

'use client';

import { useEffect, useState } from 'react';
import { Lp3hSidebar } from '@/components/lp3h/lp3h-sidebar';
import { Lp3hHeader } from '@/components/lp3h/lp3h-header';

const STORAGE_KEY = 'lp3h-sidebar-collapsed';

interface Lp3hShellProps {
  name: string;
  email: string;
  children: React.ReactNode;
}

export function Lp3hShell({ name, email, children }: Lp3hShellProps) {
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
      <Lp3hSidebar collapsed={collapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Lp3hHeader name={name} email={email} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />
        <main className="min-w-0 flex-1 overflow-x-hidden bg-muted/30 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
