// app/admin/(dashboard)/daftar-mandiri/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Eye, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { DeleteSubmissionDialog } from '@/components/admin/daftar-mandiri/delete-submission-dialog';

interface SubmissionListItem {
  id: string;
  status: string;
  createdAt: string;
  product: { name: string; umkm: { businessName: string } };
  lp3h: { name: string };
  pendamping: { name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  belum_diproses: 'Belum Diproses',
  sedang_diproses: 'Sedang Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const STATUS_VARIANTS: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  belum_diproses: 'secondary',
  sedang_diproses: 'default',
  selesai: 'outline',
  ditolak: 'destructive',
};

async function fetchSubmissions(): Promise<SubmissionListItem[]> {
  const res = await fetch('/api/admin/daftar-mandiri');
  if (!res.ok) throw new Error('Gagal memuat data pengajuan');
  const data = await res.json();
  return data.data || [];
}

export default function AdminDaftarMandiriPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin', 'daftar-mandiri'],
    queryFn: fetchSubmissions,
  });

  const [deletingSubmission, setDeletingSubmission] = useState<SubmissionListItem | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'daftar-mandiri'] });
  }

  const columns: DataTableColumn<SubmissionListItem>[] = [
    {
      header: 'Produk',
      accessor: (row) => <span className="font-medium">{toTitleCase(row.product.name)}</span>,
    },
    {
      header: 'UMKM',
      accessor: (row) => toTitleCase(row.product.umkm.businessName),
    },
    {
      header: 'LP3H',
      accessor: (row) => toTitleCase(row.lp3h.name),
    },
    {
      header: 'Pendamping',
      accessor: (row) => (row.pendamping ? toTitleCase(row.pendamping.name) : '-'),
    },
    {
      header: 'Status',
      accessor: (row) => <Badge variant={STATUS_VARIANTS[row.status] ?? 'secondary'}>{STATUS_LABELS[row.status] ?? row.status}</Badge>,
    },
    {
      header: 'Tanggal Ajukan',
      accessor: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
  ];

  const actions: DataTableAction<SubmissionListItem>[] = [
    {
      label: 'Lihat Detail',
      icon: Eye,
      onClick: (row) => router.push(`/admin/daftar-mandiri/${row.id}`),
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingSubmission(row),
    },
  ];

  function searchFn(row: SubmissionListItem, query: string) {
    const q = query.toLowerCase();
    return row.product.name.toLowerCase().includes(q) || row.product.umkm.businessName.toLowerCase().includes(q);
  }

  function sortFn(rows: SubmissionListItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.product.name.localeCompare(b.product.name);
        case 'za':
          return b.product.name.localeCompare(a.product.name);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Pengajuan Daftar Mandiri</h1>
        <p className="text-sm text-muted-foreground">Pantau pengajuan sertifikasi halal Daftar Mandiri dari seluruh UMKM.</p>
      </div>

      <DataTable
        data={submissions}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama produk atau UMKM..."
        isLoading={isLoading}
        emptyMessage="Belum ada pengajuan Daftar Mandiri."
      />

      <DeleteSubmissionDialog submission={deletingSubmission} onOpenChange={(open) => !open && setDeletingSubmission(null)} onDeleted={invalidate} />
    </div>
  );
}
