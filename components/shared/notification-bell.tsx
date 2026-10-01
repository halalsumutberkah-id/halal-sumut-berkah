// components/shared/notification-bell.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: NotificationItem[];
  unreadCount: number;
}

async function fetchNotifications(): Promise<NotificationsResponse> {
  const res = await fetch('/api/notifications');
  if (!res.ok) throw new Error('Gagal memuat notifikasi');
  return res.json();
}

export function NotificationBell() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    // dari 30 detik jadi 2 menit - notifikasi bukan chat real-time, telat
    // beberapa menit masih wajar. refetchOnWindowFocus (default true) tetap
    // aktif jadi begitu user balik ke tab, langsung fresh tanpa perlu
    // polling agresif terus-menerus
    refetchInterval: 2 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  }

  async function handleItemClick(item: NotificationItem) {
    if (!item.isRead) {
      await fetch(`/api/notifications/${item.id}/read`, { method: 'PATCH' });
      invalidate();
    }
    setOpen(false);
    if (item.link) router.push(item.link);
  }

  async function handleMarkAllRead() {
    await fetch('/api/notifications/read-all', { method: 'PATCH' });
    invalidate();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="ghost" size="icon" className="relative rounded-full">
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex size-2 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-destructive ring-2 ring-card">
                {unreadCount > 9 && <span className="sr-only">9+ notifikasi belum dibaca</span>}
              </span>
            )}
          </Button>
        }
      />

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold">Notifikasi</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllRead} className="h-auto gap-1 px-2 py-1 text-xs text-muted-foreground">
              <CheckCheck className="size-3.5" />
              Tandai semua dibaca
            </Button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-muted-foreground">Belum ada notifikasi.</p>}

          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleItemClick(item)}
              className={cn('flex w-full flex-col gap-1 border-b px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted', !item.isRead && 'bg-primary/5')}
            >
              <div className="flex items-start justify-between gap-2">
                <span className={cn('font-medium', !item.isRead && 'text-foreground')}>{item.title}</span>
                {!item.isRead && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{item.message}</p>
              <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: id })}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
