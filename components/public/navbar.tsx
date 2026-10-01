'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, ArrowRight, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { PUBLIC_NAV_LINKS, type NavChildLink } from '@/lib/public-nav-links';
import { cn } from '@/lib/utils';

// cek rekursif - apakah item ini (atau salah satu keturunannya) cocok
// sama halaman yang lagi dibuka? dipakai buat nyalain highlight di induk
// dropdown/grup walau yang aktif itu cucu-nya, bukan langsung anaknya
function isLinkActive(href: string | undefined, pathname: string) {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function hasActiveDescendant(item: NavChildLink, pathname: string): boolean {
  if (isLinkActive(item.href, pathname)) return true;
  if (!item.children) return false;
  return item.children.some((child) => hasActiveDescendant(child, pathname));
}

// render 1 item dropdown - kalau punya children sendiri, jadi submenu
// bersarang (flyout ke samping), kalau tidak, jadi link biasa. spacing
// antar item sengaja dikasih py lebih lega + margin bawah biar submenu
// bersarang tidak dempet sama item lain
function DesktopMenuItem({ item, pathname }: { item: NavChildLink; pathname: string }) {
  const isActive = hasActiveDescendant(item, pathname);

  if (item.children) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={cn('rounded-md px-3 py-2.5', isActive && 'bg-muted font-medium text-foreground')}>{item.label}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-56 space-y-0.5 p-2">
          {item.children.map((child) => (
            <DesktopMenuItem key={child.label} item={child} pathname={pathname} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem
      className={cn('rounded-md px-3 py-2.5', isActive && 'bg-muted font-medium text-foreground')}
      render={
        <a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener noreferrer' : undefined}>
          {item.label}
          {item.external && <ExternalLink className="ml-auto size-3.5 text-muted-foreground" />}
        </a>
      }
      nativeButton={false}
    />
  );
}

// render 1 item menu mobile - rekursif, bisa buka/tutup kayak accordion
// FAQ, makin dalam makin nge-indent. grup otomatis kebuka duluan kalau
// salah satu keturunannya adalah halaman yang lagi dibuka
function MobileMenuItem({ item, depth, pathname, onNavigate }: { item: NavChildLink; depth: number; pathname: string; onNavigate: () => void }) {
  const isActive = hasActiveDescendant(item, pathname);
  const [isOpen, setIsOpen] = useState(isActive);

  if (item.children) {
    return (
      <div className="flex flex-col">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={cn('flex w-full items-center justify-between rounded-md px-4 py-2.5 text-left text-sm font-medium transition-colors hover:bg-muted', isActive ? 'text-foreground' : 'text-foreground/80')}
          style={{ paddingLeft: `${16 + depth * 16}px` }}
        >
          {item.label}
          <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform duration-200', isOpen && 'rotate-180')} />
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }} className="overflow-hidden">
              <div className="flex flex-col gap-0.5 py-1">
                {item.children.map((child) => (
                  <MobileMenuItem key={child.label} item={child} depth={depth + 1} pathname={pathname} onNavigate={onNavigate} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <a
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-1.5 rounded-md border-l-2 px-4 py-2 text-sm transition-colors',
        isActive ? 'border-yellow-500 bg-muted text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
      style={{ paddingLeft: `${16 + depth * 16}px` }}
    >
      {item.label}
      {item.external && <ExternalLink className="size-3.5" />}
    </a>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-sm sm:backdrop-blur-md">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-6 md:py-7 lg:px-10">
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={48} height={48} className="w-9 sm:w-11 md:w-12" />
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-bold tracking-wide text-foreground sm:text-base md:text-lg">HALAL SUMUT</span>
            <span className="text-sm font-bold tracking-wide text-primary sm:text-base md:text-lg">BERKAH</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 whitespace-nowrap xl:flex">
          {PUBLIC_NAV_LINKS.map((link) => {
            if (link.children) {
              const groupActive = link.children.some((child) => hasActiveDescendant(child, pathname));

              return (
                <DropdownMenu key={link.label}>
                  <DropdownMenuTrigger className={cn('group relative flex items-center gap-1 px-3 py-2 text-sm font-medium outline-none transition-colors hover:text-foreground', groupActive ? 'text-foreground' : 'text-muted-foreground')}>
                    {link.label}
                    <ChevronDown className="size-3.5" />
                    <span className={cn('absolute inset-x-3 -bottom-0.5 h-0.5 origin-left rounded-full bg-yellow-500 transition-transform duration-300 ease-out', groupActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100')} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-72 space-y-0.5 p-2">
                    {link.children.map((child) => (
                      <DesktopMenuItem key={child.label} item={child} pathname={pathname} />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href!} className={cn('group relative px-3 py-2 text-sm font-medium transition-colors', isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {link.label}

                {isActive ? (
                  <motion.span layoutId="navbar-active-underline" className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-yellow-500" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                ) : (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-yellow-500 transition-transform duration-300 ease-out group-hover:scale-x-100" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={
              <Link href="/umkm/login">
                Masuk / Daftar
                <ArrowRight className="size-4" />
              </Link>
            }
            nativeButton={false}
            className="hidden h-auto rounded-full px-6 py-2.5 font-medium sm:inline-flex"
          />

          <Button variant="ghost" size="icon" className="size-10 rounded-full xl:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 overflow-y-auto duration-200!">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav className="mt-4 flex flex-col gap-1 px-4">
            {PUBLIC_NAV_LINKS.map((link) => {
              if (link.children) {
                return <MobileMenuItem key={link.label} item={{ label: link.label, children: link.children }} depth={0} pathname={pathname} onNavigate={() => setMobileOpen(false)} />;
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href!}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'rounded-md border-l-2 px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive ? 'border-yellow-500 bg-muted text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            <Button
              render={
                <Link href="/umkm/login">
                  Masuk / Daftar
                  <ArrowRight className="size-4" />
                </Link>
              }
              nativeButton={false}
              className="mt-3 h-auto w-full rounded-full py-3 font-medium"
            />
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
