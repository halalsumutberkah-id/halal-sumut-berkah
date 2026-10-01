// app/admin/(dashboard)/banners/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { BannerFormDialog, type BannerRecord } from '@/components/admin/banners/banner-form-dialog';
import { DeleteBannerDialog } from '@/components/admin/banners/delete-banner-dialog';

interface BannerListItem extends BannerRecord {
  createdAt: string;
}

interface BannerSettingsData {
  id: string;
  hideDurationHours: number;
}

async function fetchBanners(): Promise<BannerListItem[]> {
  const res = await fetch('/api/admin/banners');
  if (!res.ok) throw new Error('Gagal memuat daftar banner');
  const data = await res.json();
  return data.data || [];
}

async function fetchSettings(): Promise<BannerSettingsData> {
  const res = await fetch('/api/admin/banner-settings');
  const data = await res.json();
  return data.data;
}

function DurationSettingsCard() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['admin', 'banner-settings'],
    queryFn: fetchSettings,
    staleTime: 60 * 1000,
  });

  const [hours, setHours] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const currentValue = hours ?? settings?.hideDurationHours ?? 24;

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/banner-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hideDurationHours: currentValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success('Durasi berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['admin', 'banner-settings'] });
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="size-4" />
          </div>
          <div>
            <Label>Sembunyikan Pop-up Selama (jam)</Label>
            <p className="text-xs text-muted-foreground">Kalau pengunjung menutup pop-up (klik silang), pop-up tidak akan muncul lagi sampai durasi ini berlalu (tersimpan di perangkat pengunjung).</p>
            <Input type="number" min={1} className="mt-2 w-32" value={currentValue} onChange={(e) => setHours(Number(e.target.value))} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="w-fit">
          {isSaving ? 'Menyimpan...' : 'Simpan Durasi'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdminBannersPage() {
  const queryClient = useQueryClient();

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: fetchBanners,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerRecord | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<BannerRecord | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] });
  }

  const columns: DataTableColumn<BannerListItem>[] = [
    {
      header: 'Preview',
      accessor: (row) => (
        <div className="relative h-12 w-20 overflow-hidden rounded-md border bg-muted">
          <Image src={row.imageUrl} alt="Banner" fill className="object-cover" />
        </div>
      ),
    },
    {
      header: 'Link',
      accessor: (row) => <span className="max-w-48 truncate text-xs text-muted-foreground">{row.link || '-'}</span>,
    },
    {
      header: 'Urutan',
      accessor: (row) => row.sequence,
    },
    {
      header: 'Status',
      accessor: (row) => <Badge variant={row.isActive ? 'default' : 'outline'}>{row.isActive ? 'Aktif' : 'Nonaktif'}</Badge>,
    },
  ];

  const actions: DataTableAction<BannerListItem>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        setEditingBanner(row);
        setFormOpen(true);
      },
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingBanner(row),
    },
  ];

  function searchFn(row: BannerListItem, query: string) {
    return (row.link || '').toLowerCase().includes(query.toLowerCase());
  }

  function sortFn(rows: BannerListItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return a.sequence - b.sequence;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Banner Promosi</h1>
          <p className="text-sm text-muted-foreground">Kelola gambar pop-up slider yang tampil di halaman publik.</p>
        </div>
        <Button
          onClick={() => {
            setEditingBanner(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Tambah Banner
        </Button>
      </div>

      <DurationSettingsCard />

      <DataTable
        data={banners}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari berdasarkan link..."
        isLoading={isLoading}
        emptyMessage="Belum ada banner. Klik 'Tambah Banner' untuk mulai."
      />

      <BannerFormDialog open={formOpen} onOpenChange={setFormOpen} banner={editingBanner} onSuccess={invalidate} />

      <DeleteBannerDialog banner={deletingBanner} onOpenChange={(open) => !open && setDeletingBanner(null)} onDeleted={invalidate} />
    </div>
  );
}
