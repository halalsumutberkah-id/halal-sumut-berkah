// app/admin/(dashboard)/statistics/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { TOTAL_PROVINSI } from '@/lib/statistics';
import { StatisticFormDialog, type StatisticRecord } from '@/components/admin/statistics/statistic-form-dialog';
import { DeleteStatisticDialog } from '@/components/admin/statistics/delete-statistic-dialog';

async function fetchStatistics(): Promise<StatisticRecord[]> {
  const res = await fetch('/api/admin/statistics');
  if (!res.ok) throw new Error('Gagal memuat data statistik');
  const data = await res.json();
  return data.data || [];
}

export default function AdminStatisticsPage() {
  const queryClient = useQueryClient();

  const { data: statistics = [], isLoading } = useQuery({
    queryKey: ['admin', 'statistics'],
    queryFn: fetchStatistics,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingStatistic, setEditingStatistic] = useState<StatisticRecord | null>(null);
  const [deletingStatistic, setDeletingStatistic] = useState<StatisticRecord | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'statistics'] });
  }

  function handleAdd() {
    setEditingStatistic(null);
    setFormOpen(true);
  }

  function handleEdit(row: StatisticRecord) {
    setEditingStatistic(row);
    setFormOpen(true);
  }

  const columns: DataTableColumn<StatisticRecord>[] = [
    {
      header: 'Periode',
      accessor: (row) => <span className="font-medium">{row.period}</span>,
    },
    {
      header: 'Wilayah',
      accessor: (row) => (row.kabupaten === TOTAL_PROVINSI ? <Badge>{row.kabupaten}</Badge> : <span>{row.kabupaten}</span>),
    },
    {
      header: 'Jumlah UMKM Tersertifikasi',
      accessor: (row) => <span>{row.certifiedCount.toLocaleString('id-ID')}</span>,
    },
  ];

  const actions: DataTableAction<StatisticRecord>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: handleEdit,
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingStatistic(row),
    },
  ];

  function searchFn(row: StatisticRecord, query: string) {
    return row.period.toLowerCase().includes(query.toLowerCase()) || row.kabupaten.toLowerCase().includes(query.toLowerCase());
  }

  function sortFn(rows: StatisticRecord[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return b.period.localeCompare(a.period);
        case 'oldest':
          return a.period.localeCompare(b.period);
        case 'az':
          return a.kabupaten.localeCompare(b.kabupaten);
        case 'za':
          return b.kabupaten.localeCompare(a.kabupaten);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Statistik Sertifikasi Halal</h1>
          <p className="text-sm text-muted-foreground">Kelola data jumlah UMKM tersertifikasi halal per periode, ditampilkan sebagai grafik di halaman Tentang Kami.</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus className="size-4" />
          Tambah Data
        </Button>
      </div>

      <DataTable
        data={statistics}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari periode atau wilayah..."
        isLoading={isLoading}
        emptyMessage='Belum ada data statistik. Klik "Tambah Data" untuk mulai mengisi.'
      />

      <StatisticFormDialog open={formOpen} onOpenChange={setFormOpen} statistic={editingStatistic} onSuccess={invalidate} />

      <DeleteStatisticDialog statistic={deletingStatistic} onOpenChange={(open) => !open && setDeletingStatistic(null)} onDeleted={invalidate} />
    </div>
  );
}
