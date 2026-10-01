// components/shared/sidebar-nav.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type LucideIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  children: NavItem[];
}

export type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry;
}

function isChildActive(group: NavGroup, pathname: string) {
  return group.children.some((c) => pathname === c.href || pathname.startsWith(`${c.href}/`));
}

interface SidebarNavProps {
  items: NavEntry[];
  collapsed?: boolean;
  onNavigate?: () => void;
}

export function SidebarNav({ items, collapsed = false, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((entry) => {
        if (isNavGroup(entry)) {
          return <NavGroupItem key={entry.label} group={entry} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />;
        }

        return <NavLinkItem key={entry.href} item={entry} collapsed={collapsed} pathname={pathname} onNavigate={onNavigate} />;
      })}
    </nav>
  );
}

function NavLinkItem({ item, collapsed, pathname, onNavigate }: { item: NavItem; collapsed: boolean; pathname: string; onNavigate?: () => void }) {
  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
  const Icon = item.icon;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        collapsed && 'justify-center px-2',
        isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );

  if (!collapsed) return <div>{link}</div>;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

// grup dropdown - kalau sidebar dalam mode LEBAR, jadi accordion (buka/tutup
// di tempat, TIDAK memicu onNavigate biar Sheet mobile tidak ketutup pas
// cuma buka/tutup grup). kalau sidebar dalam mode COLLAPSED (cuma ikon),
// jadi popover flyout ke samping pas diklik
function NavGroupItem({ group, collapsed, pathname, onNavigate }: { group: NavGroup; collapsed: boolean; pathname: string; onNavigate?: () => void }) {
  const hasActiveChild = isChildActive(group, pathname);
  const [isOpen, setIsOpen] = useState(hasActiveChild);
  const Icon = group.icon;

  if (collapsed) {
    return (
      <Popover>
        <PopoverTrigger
          render={
            <button
              type="button"
              className={cn(
                'flex w-full items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors',
                hasActiveChild ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="size-4 shrink-0" />
            </button>
          }
        />
        <PopoverContent side="right" align="start" className="w-48 p-1">
          <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group.label}</p>
          {group.children.map((child) => {
            const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
              >
                <ChildIcon className="size-3.5 shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={(e) => {
          // stopPropagation - biar klik tombol buka/tutup grup ini TIDAK
          // ke-anggap "navigasi" sama pembungkus di luar (Sheet mobile)
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className={cn('flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', hasActiveChild && !isOpen ? 'text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
      >
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">{group.label}</span>
        <ChevronDown className={cn('size-3.5 shrink-0 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="mt-1 flex flex-col gap-1 border-l border-border pl-3">
          {group.children.map((child) => {
            const isActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
            const ChildIcon = child.icon;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn('flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground')}
              >
                <ChildIcon className="size-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
