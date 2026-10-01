'use client';

import { KeyRound } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toTitleCase } from '@/lib/title-case';

interface UserMenuProps {
  name: string;
  email: string;
  changePasswordHref: string;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function UserMenu({ name, email, changePasswordHref }: UserMenuProps) {
  const displayName = toTitleCase(name);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">{getInitials(name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs font-normal text-muted-foreground">{email}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href={changePasswordHref}>
              <KeyRound className="size-4" />
              Ganti Password
            </Link>
          }
          nativeButton={false}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
