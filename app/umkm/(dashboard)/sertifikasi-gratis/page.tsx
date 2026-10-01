// app/umkm/(dashboard)/sertifikasi-gratis/page.tsx

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { SertifikasiGratisFormDialog } from '@/components/umkm/sertifikasi-gratis/sertifikasi-gratis-form-dialog';
import { SertifikasiGratisDetailSheet } from '@/components/umkm/sertifikasi-gratis/sertifikasi-gratis-detail-sheet';

interface SubmissionItem {
  id: string;
  status: string;
  createdAt: string;
  products: { product: { id: string; name: string } }[];
  lp3h: { name: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  menunggu_verifikasi: 'Menunggu Verifikasi',
  ditugaskan: 'Ditugaskan',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const STATUS_VARIANTS: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  menunggu_verifikasi: 'secondary',
  ditugaskan: 'default',
  selesai: 'outline',
  ditolak: 'destructive',
};

function formatText(text: string) {
  const titleCased = toTitleCase(text);
  return titleCased
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\bpt\b/gi, 'PT')
    .replace(/\bcv\b/gi, 'CV')
    .replace(/\bud\b/gi, 'UD')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchSubmissions(): Promise<SubmissionItem[]> {
  const res = await fetch('/api/umkm/sertifikasi-gratis');
  const data = await res.json();
  if (!res.ok) throw new Error('Gagal memuat pengajuan');
  return data.data || [];
}

export default function UmkmSertifikasiGratisPage() {
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['umkm', 'sertifikasi-gratis'],
    queryFn: fetchSubmissions,
    staleTime: 30 * 1000,
  });

  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // tombol "Ajukan Sertifikasi Halal (Gratis)" di halaman E-Catalog
  // mengarah ke sini dengan ?ajukan=1 - langsung buka modal pengajuan,
  // lalu bersihkan param dari URL supaya refresh/back tidak membuka
  // modal lagi. Baca dari window.location (bukan useSearchParams) biar
  // gak butuh Suspense boundary.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('ajukan') === '1') {
      setFormOpen(true);
      router.replace('/umkm/sertifikasi-gratis', { scroll: false });
    }
  }, [router]);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['umkm', 'sertifikasi-gratis'] });
    // halaman E-Catalog produk (app/umkm/(dashboard)/products) pakai
    // query ini buat nentuin tombol "Ajukan Sertifikasi Halal" muncul
    // atau tidak - begitu submit sukses di sini, produk yang tadi
    // eligible sekarang udah "menunggu_verifikasi", jadi cache-nya
    // harus ikut di-invalidate biar konsisten pas UMKM balik ke halaman
    // produk
    queryClient.invalidateQueries({ queryKey: ['umkm', 'sertifikasi-gratis', 'eligible-products'] });
  }

  // filter per-kolom (pola "kayak Excel")
  const [lp3hFilter, setLp3hFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const lp3hOptions = useMemo(() => {
    const names = Array.from(new Set(submissions.map((s) => s.lp3h?.name).filter((v): v is string => Boolean(v))));
    return names.map((n) => ({ value: n, label: formatText(n) }));
  }, [submissions]);
  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  const filteredSubmissions = submissions.filter((row) => {
    if (lp3hFilter !== 'all' && row.lp3h?.name !== lp3hFilter) return false;
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    return true;
  });

  const columns: DataTableColumn<SubmissionItem>[] = [
    {
      id: 'products',
      header: 'Produk',
      accessor: (row) => (
        <span className="font-medium">{row.products.length === 0 ? '-' : row.products.length === 1 ? formatText(row.products[0].product.name) : `${formatText(row.products[0].product.name)} +${row.products.length - 1} lainnya`}</span>
      ),
      className: 'min-w-[180px]',
    },
    {
      id: 'lp3h',
      header: <HeaderFilterSelect value={lp3hFilter} onChange={setLp3hFilter} placeholder="LP3H" options={lp3hOptions} />,
      accessor: (row) => (row.lp3h ? formatText(row.lp3h.name) : '-'),
      className: 'min-w-[150px] whitespace-nowrap',
      sortKey: (row) => row.lp3h?.name.toLowerCase() ?? null,
    },
    {
      id: 'status',
      header: <HeaderFilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={statusOptions} />,
      accessor: (row) => <Badge variant={STATUS_VARIANTS[row.status] ?? 'secondary'}>{STATUS_LABELS[row.status] ?? row.status}</Badge>,
      className: 'min-w-[170px] whitespace-nowrap',
    },
    {
      id: 'createdAt',
      header: 'Diajukan',
      accessor: (row) => formatDate(row.createdAt),
      className: 'whitespace-nowrap',
      sortKey: (row) => new Date(row.createdAt),
    },
  ];

  const actions: DataTableAction<SubmissionItem>[] = [
    {
      label: 'Lihat Detail',
      icon: Eye,
      onClick: (row) => setSelectedId(row.id),
    },
  ];

  function searchFn(row: SubmissionItem, query: string) {
    const q = query.toLowerCase();
    return row.products.some((p) => p.product.name.toLowerCase().includes(q)) || (row.lp3h?.name.toLowerCase().includes(q) ?? false) || (STATUS_LABELS[row.status] ?? row.status).toLowerCase().includes(q);
  }

  function sortFn(rows: SubmissionItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Self Declare</h1>
          <p className="mt-1 text-sm text-muted-foreground">Ajukan produk anda untuk disertifikasi halal secara gratis, Admin akan menugaskan LP3H dan Pendamping untuk membantu proses hingga selesai.</p>
        </div>

        <Button onClick={() => setFormOpen(true)} className="w-full sm:w-auto">
          <Plus className="size-4" />
          Ajukan Self Declare
        </Button>
      </div>

      <DataTable
        data={filteredSubmissions}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama produk..."
        isLoading={isLoading}
        emptyMessage="Tidak ada pengajuan yang cocok dengan filter/pencarian."
      />

      <SertifikasiGratisFormDialog open={formOpen} onOpenChange={setFormOpen} onSuccess={invalidate} />

      <SertifikasiGratisDetailSheet submissionId={selectedId} onOpenChange={(open) => !open && setSelectedId(null)} />
    </div>
  );
}
