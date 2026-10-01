'use client';

import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
  loginPath: string;
  collapsed?: boolean;
}

export function LogoutButton({ loginPath, collapsed = false }: LogoutButtonProps) {
  const button = (
    <Button variant="ghost" onClick={() => signOut({ callbackUrl: loginPath })} className={cn('w-full text-destructive hover:bg-destructive/10 hover:text-destructive', collapsed ? 'justify-center px-2' : 'justify-start gap-3')}>
      <LogOut className="size-4 shrink-0" />
      {!collapsed && <span>Keluar</span>}
    </Button>
  );

  if (!collapsed) return button;

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent side="right">Keluar</TooltipContent>
    </Tooltip>
  );
}
