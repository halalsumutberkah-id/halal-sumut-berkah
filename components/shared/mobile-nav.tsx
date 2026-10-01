// components/shared/mobile-nav.tsx

'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SidebarNav, type NavEntry } from '@/components/shared/sidebar-nav';
import { LogoutButton } from '@/components/shared/logout-button';

interface MobileNavProps {
  items: NavEntry[];
  title: string;
  loginPath: string;
}

export function MobileNav({ items, title, loginPath }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="size-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="flex w-64 flex-col p-4">
        <SheetHeader className="px-0">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 flex-1 overflow-y-auto">
          <SidebarNav items={items} onNavigate={() => setOpen(false)} />
        </div>

        <div className="border-t pt-3">
          <LogoutButton loginPath={loginPath} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
