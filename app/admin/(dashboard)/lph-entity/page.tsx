// app/admin/(dashboard)/lph-entity/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toTitleCase } from '@/lib/title-case';
import { exportToExcel } from '@/lib/export-excel';
import { formatDate } from '@/lib/utils';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { LphEntityFormDialog, type LphEntityRecord } from '@/components/admin/lph-entity/lph-entity-form-dialog';
import { DeleteLphEntityDialog } from '@/components/admin/lph-entity/delete-lph-entity-dialog';

interface LphEntityListItem extends LphEntityRecord {
  createdAt: string;
}

function formatLphName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\blph\b/gi, 'LPH').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchLphList(): Promise<LphEntityListItem[]> {
  const res = await fetch('/api/admin/lph-entity');
  if (!res.ok) throw new Error('Gagal memuat daftar LPH');
  const data = await res.json();
  return data.data || [];
}

// data mentah, 1 baris per LPH, biar bisa difilter/di-sort bebas
// langsung di Excel
// data mentah, SEMUA field yang ada di database (bukan cuma yang
// tampil di tabel)
function buildExportRows(lphList: LphEntityListItem[]) {
  return lphList.map((row) => ({
    'Nama LPH': formatLphName(row.name),
    'Kabupaten/Kota': toTitleCase(row.kabupaten),
    Telepon: row.phone,
    'Email Resmi': row.email || '-',
    'Kontak CS/WhatsApp': row.contactWhatsapp || '-',
    'No. Registrasi BPJPH': row.registrationNumberBpjph || '-',
    'Masa Berlaku SK': row.skValidUntil ? formatDate(row.skValidUntil) : '-',
    'Lingkup Pemeriksaan': row.inspectionScope || '-',
    'Alamat Lengkap': toTitleCase(row.address),
    Deskripsi: row.description || '-',
  }));
}

export default function AdminLphEntityPage() {
  const queryClient = useQueryClient();

  const { data: lphList = [], isLoading } = useQuery({
    queryKey: ['admin', 'lph-entity'],
    queryFn: fetchLphList,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingLph, setEditingLph] = useState<LphEntityRecord | null>(null);
  const [deletingLph, setDeletingLph] = useState<LphEntityRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // filter per-kolom (pola "kayak Excel")
  const [kabupatenFilter, setKabupatenFilter] = useState('all');

  const kabupatenOptions = useMemo(() => {
    const names = Array.from(new Set(lphList.map((l) => l.kabupaten)));
    return names.map((n) => ({ value: n, label: toTitleCase(n) }));
  }, [lphList]);

  const filteredList = lphList.filter((row) => {
    if (kabupatenFilter !== 'all' && row.kabupaten !== kabupatenFilter) return false;
    return true;
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'lph-entity'] });
  }

  async function handleExport() {
    if (isExporting || lphList.length === 0) return;
    setIsExporting(true);
    try {
      await exportToExcel(buildExportRows(lphList), 'LPH', 'lph');
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<LphEntityListItem>[] = [
    { id: 'name', header: 'Nama LPH', accessor: (row) => <span className="font-medium">{formatLphName(row.name)}</span>, className: 'min-w-[180px]', sortKey: (row) => row.name.toLowerCase() },
    {
      id: 'kabupaten',
      header: <HeaderFilterSelect value={kabupatenFilter} onChange={setKabupatenFilter} placeholder="Kabupaten/Kota" options={kabupatenOptions} />,
      accessor: (row) => toTitleCase(row.kabupaten),
      className: 'min-w-[150px] whitespace-nowrap',
      sortKey: (row) => row.kabupaten.toLowerCase(),
    },
    { id: 'phone', header: 'Telepon', accessor: (row) => row.phone, className: 'whitespace-nowrap' },
    { id: 'email', header: 'Email', accessor: (row) => row.email || '-', className: 'min-w-[180px]', sortKey: (row) => (row.email ?? '').toLowerCase() },
  ];

  const actions: DataTableAction<LphEntityListItem>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        setEditingLph(row);
        setFormOpen(true);
      },
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingLph(row),
    },
  ];

  function searchFn(row: LphEntityListItem, query: string) {
    const q = query.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.kabupaten.toLowerCase().includes(q) || (row.email ?? '').toLowerCase().includes(q);
  }

  function sortFn(rows: LphEntityListItem[], sort: SortOption) {
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
          <h1 className="text-xl font-semibold text-foreground">Manajemen LPH</h1>
          <p className="text-sm text-muted-foreground">Kelola data LPH (Lembaga Pemeriksa Halal) yang tampil di direktori publik. LPH tidak memiliki akun login.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || lphList.length === 0} className="w-full sm:w-auto">
            <FileSpreadsheet className="size-4" />
            {isExporting ? 'Menyiapkan...' : 'Export Excel'}
          </Button>
          <Button
            onClick={() => {
              setEditingLph(null);
              setFormOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="size-4" />
            Tambah LPH
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredList}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama LPH atau kabupaten/kota..."
        isLoading={isLoading}
        emptyMessage="Tidak ada LPH yang cocok dengan filter/pencarian."
      />

      <LphEntityFormDialog open={formOpen} onOpenChange={setFormOpen} lph={editingLph} onSuccess={invalidate} />

      <DeleteLphEntityDialog lph={deletingLph} onOpenChange={(open) => !open && setDeletingLph(null)} onDeleted={invalidate} />
    </div>
  );
}
