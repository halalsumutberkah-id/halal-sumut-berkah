// app/admin/(dashboard)/fasilitasi-code/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { FasilitasiCodeFormDialog, type FasilitasiCodeRecord } from '@/components/admin/fasilitasi-code/fasilitasi-code-form-dialog';
import { DeleteFasilitasiCodeDialog } from '@/components/admin/fasilitasi-code/delete-fasilitasi-code-dialog';

interface FasilitasiCodeListItem {
  id: string;
  code: string;
  quota: number;
  isActive: boolean;
  createdAt: string;
  _count: { submissions: number };
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Aktif' },
  { value: 'inactive', label: 'Nonaktif' },
];

async function fetchFasilitasiCodeList(): Promise<FasilitasiCodeListItem[]> {
  const res = await fetch('/api/admin/fasilitasi-code');
  if (!res.ok) throw new Error('Gagal memuat daftar Kode Fasilitasi');
  const data = await res.json();
  return data.data || [];
}

// data mentah, SEMUA field yang ada di database
function buildExportRows(codes: FasilitasiCodeListItem[]) {
  return codes.map((row) => ({
    Kode: row.code,
    Kuota: row.quota,
    Terpakai: row._count.submissions,
    Sisa: Math.max(row.quota - row._count.submissions, 0),
    Status: row.isActive ? 'Aktif' : 'Nonaktif',
    'Tanggal Dibuat': formatDate(row.createdAt),
  }));
}

export default function AdminFasilitasiCodePage() {
  const queryClient = useQueryClient();

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['admin', 'fasilitasi-code'],
    queryFn: fetchFasilitasiCodeList,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<FasilitasiCodeRecord | null>(null);
  const [deletingCode, setDeletingCode] = useState<FasilitasiCodeRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // filter per-kolom (pola "kayak Excel")
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCodes = codes.filter((row) => {
    if (statusFilter === 'active' && !row.isActive) return false;
    if (statusFilter === 'inactive' && row.isActive) return false;
    return true;
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'fasilitasi-code'] });
  }

  async function handleExport() {
    if (isExporting || codes.length === 0) return;
    setIsExporting(true);
    try {
      await exportToExcel(buildExportRows(codes), 'Kode Fasilitasi', 'kode-fasilitasi');
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<FasilitasiCodeListItem>[] = [
    {
      id: 'code',
      header: 'Kode',
      accessor: (row) => <span className="font-mono font-medium">{row.code}</span>,
      sortKey: (row) => row.code.toLowerCase(),
    },
    {
      id: 'quota',
      header: 'Kuota',
      accessor: (row) => row.quota,
      sortKey: (row) => row.quota,
    },
    {
      id: 'used',
      header: 'Terpakai',
      accessor: (row) => row._count.submissions,
      sortKey: (row) => row._count.submissions,
    },
    {
      id: 'remaining',
      header: 'Sisa',
      accessor: (row) => {
        const sisa = row.quota - row._count.submissions;
        return <Badge variant={sisa <= 0 ? 'destructive' : 'secondary'}>{Math.max(sisa, 0)}</Badge>;
      },
    },
    {
      id: 'isActive',
      header: <HeaderFilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={STATUS_OPTIONS} />,
      accessor: (row) => <Badge variant={row.isActive ? 'default' : 'outline'}>{row.isActive ? 'Aktif' : 'Nonaktif'}</Badge>,
      className: 'min-w-[130px] whitespace-nowrap',
    },
  ];

  const actions: DataTableAction<FasilitasiCodeListItem>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        setEditingCode(row);
        setFormOpen(true);
      },
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingCode(row),
    },
  ];

  function searchFn(row: FasilitasiCodeListItem, query: string) {
    return row.code.toLowerCase().includes(query.toLowerCase());
  }

  function sortFn(rows: FasilitasiCodeListItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.code.localeCompare(b.code);
        case 'za':
          return b.code.localeCompare(a.code);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kode Fasilitasi</h1>
          <p className="text-sm text-muted-foreground">
            Kelola kode referensi yang dipakai Pendamping (P3H) saat memproses pengajuan Self Declare di portal SIHALAL. Kode dialokasikan otomatis ke pengajuan baru berdasarkan urutan dan kuota di bawah.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || codes.length === 0} className="w-full sm:w-auto">
            <FileSpreadsheet className="size-4" />
            {isExporting ? 'Menyiapkan...' : 'Export Excel'}
          </Button>
          <Button
            onClick={() => {
              setEditingCode(null);
              setFormOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="size-4" />
            Tambah Kode
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredCodes}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari kode..."
        isLoading={isLoading}
        emptyMessage="Tidak ada Kode Fasilitasi yang cocok dengan filter/pencarian."
      />

      <FasilitasiCodeFormDialog open={formOpen} onOpenChange={setFormOpen} fasilitasiCode={editingCode} onSuccess={invalidate} />

      <DeleteFasilitasiCodeDialog fasilitasiCode={deletingCode} onOpenChange={(open) => !open && setDeletingCode(null)} onDeleted={invalidate} />
    </div>
  );
}
