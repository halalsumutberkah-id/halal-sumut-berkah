// app/admin/(dashboard)/lp3h/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, KeyRound, Trash2, Eye, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { Lp3hFormDialog, type Lp3hRecord } from '@/components/admin/lp3h/lp3h-form-dialog';
import { Lp3hCredentialsDialog } from '@/components/admin/lp3h/lp3h-credentials-dialog';
import { DeleteLp3hDialog } from '@/components/admin/lp3h/delete-lp3h-dialog';
import { ResetPasswordDialog } from '@/components/admin/lp3h/reset-password-dialog';

interface Lp3hListItem extends Lp3hRecord {
  createdAt: string;
  _count: { pendampings: number };
}

function formatLp3hName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\blp3h\b/gi, 'LP3H').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchLp3hList(): Promise<Lp3hListItem[]> {
  const res = await fetch('/api/admin/lp3h');
  if (!res.ok) throw new Error('Gagal memuat daftar LP3H');
  const data = await res.json();
  return data.data || [];
}

// data mentah, 1 baris per LP3H, biar bisa difilter/di-sort bebas
// langsung di Excel
function buildExportRows(lp3hList: Lp3hListItem[]) {
  return lp3hList.map((row) => ({
    'Nama LP3H': formatLp3hName(row.name),
    Email: row.user.email,
    Telepon: row.phone,
    'Jumlah Pendamping': row._count.pendampings,
    'Tanggal Terdaftar': formatDate(row.createdAt),
  }));
}

async function exportLp3hToExcel(lp3hList: Lp3hListItem[]) {
  await exportToExcel(buildExportRows(lp3hList), 'LP3H', 'lp3h');
}

export default function AdminLp3hPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: lp3hList = [], isLoading } = useQuery({
    queryKey: ['admin', 'lp3h'],
    queryFn: fetchLp3hList,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingLp3h, setEditingLp3h] = useState<Lp3hRecord | null>(null);
  const [deletingLp3h, setDeletingLp3h] = useState<Lp3hRecord | null>(null);
  const [resettingLp3h, setResettingLp3h] = useState<Lp3hRecord | null>(null);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'lp3h'] });
  }

  async function handleExport() {
    if (isExporting || lp3hList.length === 0) return;
    setIsExporting(true);
    try {
      await exportLp3hToExcel(lp3hList);
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<Lp3hListItem>[] = [
    {
      header: 'Nama LP3H',
      accessor: (row) => <span className="font-medium">{formatLp3hName(row.name)}</span>,
    },
    {
      header: 'Email',
      accessor: (row) => <span className="text-muted-foreground">{row.user.email}</span>,
    },
    {
      header: 'Telepon',
      accessor: (row) => <span className="text-muted-foreground">{row.phone}</span>,
    },
    {
      header: 'Pendamping',
      accessor: (row) => <Badge variant="secondary">{row._count.pendampings} orang</Badge>,
    },
  ];

  const actions: DataTableAction<Lp3hListItem>[] = [
    {
      label: 'Lihat Profil',
      icon: Eye,
      onClick: (row) => router.push(`/admin/lp3h/${row.id}`),
    },
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        setEditingLp3h(row);
        setFormOpen(true);
      },
    },
    {
      label: 'Ubah Password',
      icon: KeyRound,
      onClick: (row) => setResettingLp3h(row),
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingLp3h(row),
    },
  ];

  function searchFn(row: Lp3hListItem, query: string) {
    const q = query.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.user.email.toLowerCase().includes(q);
  }

  function sortFn(rows: Lp3hListItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Manajemen LP3H</h1>
          <p className="text-sm text-muted-foreground">Kelola akun Lembaga Pendamping Proses Produk Halal yang terdaftar di sistem.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || lp3hList.length === 0} className="w-full sm:w-auto">
            <FileSpreadsheet className="size-4" />
            {isExporting ? 'Menyiapkan...' : 'Export Excel'}
          </Button>
          <Button
            onClick={() => {
              setEditingLp3h(null);
              setFormOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="size-4" />
            Tambah LP3H
          </Button>
        </div>
      </div>

      <DataTable
        data={lp3hList}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama atau email LP3H..."
        isLoading={isLoading}
        emptyMessage="Belum ada LP3H terdaftar."
      />

      <Lp3hFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        lp3h={editingLp3h}
        onCreated={(creds) => {
          setCredentials(creds);
          invalidate();
        }}
        onUpdated={invalidate}
      />

      <Lp3hCredentialsDialog credentials={credentials} onClose={() => setCredentials(null)} />

      <DeleteLp3hDialog lp3h={deletingLp3h} onOpenChange={(open) => !open && setDeletingLp3h(null)} onDeleted={invalidate} />

      <ResetPasswordDialog lp3h={resettingLp3h} onOpenChange={(open) => !open && setResettingLp3h(null)} onSuccess={setCredentials} />
    </div>
  );
}
