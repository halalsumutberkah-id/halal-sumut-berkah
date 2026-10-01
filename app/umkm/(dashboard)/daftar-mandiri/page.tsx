// app/umkm/(dashboard)/daftar-mandiri/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { DaftarMandiriFormDialog } from '@/components/umkm/daftar-mandiri/daftar-mandiri-form-dialog';
import { DaftarMandiriDetailSheet } from '@/components/umkm/daftar-mandiri/daftar-mandiri-detail-sheet';

interface ProductOption {
  id: string;
  name: string;
  halalStatus: string;
}

interface SubmissionItem {
  id: string;
  status: string;
  createdAt: string;
  product: { id: string; name: string; photoUrl: string | null };
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

async function fetchSubmissions(): Promise<SubmissionItem[]> {
  const res = await fetch('/api/umkm/daftar-mandiri');
  if (!res.ok) throw new Error('Gagal memuat daftar pengajuan');
  const data = await res.json();
  return data.data || [];
}

async function fetchProducts(): Promise<ProductOption[]> {
  const res = await fetch('/api/umkm/products');
  const data = await res.json();
  return (data.data || []).map((p: any) => ({ id: p.id, name: p.name, halalStatus: p.halalStatus }));
}

export default function UmkmDaftarMandiriPage() {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['umkm', 'daftar-mandiri'],
    queryFn: fetchSubmissions,
  });

  const { data: products = [] } = useQuery({
    queryKey: ['umkm', 'products', 'options'],
    queryFn: fetchProducts,
  });

  // produk yang masih punya pengajuan AKTIF (belum_diproses/sedang_diproses)
  // ATAU yang statusnya sudah "halal" (sudah resmi bersertifikat, tidak
  // perlu/tidak boleh diajukan Self Declare lagi) disembunyikan dari
  // pilihan, biar UMKM tidak bisa ajukan dobel dari sisi UI juga (bukan
  // cuma ketolak pas submit di server)
  const activeProductIds = new Set(submissions.filter((s) => s.status === 'belum_diproses' || s.status === 'sedang_diproses').map((s) => s.product.id));
  const availableProducts = products.filter((p) => !activeProductIds.has(p.id) && p.halalStatus !== 'halal');

  const [formOpen, setFormOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['umkm', 'daftar-mandiri'] });
    queryClient.invalidateQueries({ queryKey: ['umkm', 'products'] });
  }

  const columns: DataTableColumn<SubmissionItem>[] = [
    {
      header: 'Produk',
      accessor: (row) => <span className="font-medium">{toTitleCase(row.product.name)}</span>,
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

  const actions: DataTableAction<SubmissionItem>[] = [
    {
      label: 'Lihat Detail',
      icon: Eye,
      onClick: (row) => setSelectedSubmissionId(row.id),
    },
  ];

  function searchFn(row: SubmissionItem, query: string) {
    const q = query.toLowerCase();
    return row.product.name.toLowerCase().includes(q) || row.lp3h.name.toLowerCase().includes(q);
  }

  function sortFn(rows: SubmissionItem[], sort: SortOption) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Daftar Mandiri</h1>
          <p className="text-sm text-muted-foreground">Ajukan pendampingan sertifikasi halal Daftar Mandiri untuk produk anda.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} disabled={availableProducts.length === 0}>
          <Plus className="size-4" />
          Ajukan Sertifikasi
        </Button>
      </div>

      {products.length === 0 && <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Anda belum punya produk. Tambahkan produk terlebih dahulu di menu E-Catalog sebelum mengajukan sertifikasi halal.</div>}

      {products.length > 0 && availableProducts.length === 0 && (
        <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Semua produk anda sedang memiliki pengajuan aktif. Tunggu sampai pengajuan sebelumnya selesai atau ditolak sebelum mengajukan produk yang sama lagi.
        </div>
      )}

      <DataTable
        data={submissions}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari produk atau LP3H..."
        isLoading={isLoading}
        emptyMessage="Belum ada pengajuan sertifikasi halal."
      />

      <DaftarMandiriFormDialog open={formOpen} onOpenChange={setFormOpen} products={availableProducts} onSuccess={invalidate} />

      <DaftarMandiriDetailSheet submissionId={selectedSubmissionId} onOpenChange={(open) => !open && setSelectedSubmissionId(null)} />
    </div>
  );
}
