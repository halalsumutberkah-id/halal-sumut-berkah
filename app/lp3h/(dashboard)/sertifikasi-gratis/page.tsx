// app/lp3h/(dashboard)/sertifikasi-gratis/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, FileSpreadsheet } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { Lp3hSertifikasiGratisDetailSheet } from '@/components/lp3h/sertifikasi-gratis/lp3h-sertifikasi-gratis-detail-sheet';

interface SubmissionItem {
  id: string;
  status: string;
  createdAt: string;
  umkm: {
    businessName: string;
    ownerName: string;
    businessContactNumber: string | null;
    establishedYear: number;
    businessKecamatan: string;
    businessKabupaten: string;
    businessAddress: string;
    businessType: string;
    nibNumber: string;
    businessCategory: { name: string };
  };
  products: { product: { name: string; price: number; category: { name: string } } }[];
  pendamping: { name: string } | null;
  fasilitasiCode: { code: string } | null;
}

const STATUS_LABELS: Record<string, string> = {
  ditugaskan: 'Ditugaskan',
  selesai: 'Selesai',
};

const STATUS_VARIANTS: Record<string, 'default' | 'outline'> = {
  ditugaskan: 'default',
  selesai: 'outline',
};

async function fetchSubmissions(): Promise<SubmissionItem[]> {
  const res = await fetch('/api/lp3h/sertifikasi-gratis');
  const data = await res.json();
  return data.data || [];
}

// data mentah, 1 baris per produk (bukan di-flatten "3 produk") biar
// bisa difilter/di-sort bebas di Excel
// data mentah, 1 baris per produk (bukan di-flatten "3 produk") biar
// bisa difilter/di-sort bebas di Excel
function buildExportRows(submissions: SubmissionItem[]) {
  return submissions.flatMap((s) =>
    s.products.map(({ product }) => ({
      UMKM: toTitleCase(s.umkm.businessName),
      'Nama Pelaku Usaha': toTitleCase(s.umkm.ownerName),
      Kontak: s.umkm.businessContactNumber || '-',
      'Kategori Usaha': toTitleCase(s.umkm.businessCategory.name),
      'Jenis Usaha': s.umkm.businessType,
      'Tahun Berdiri Usaha': s.umkm.establishedYear,
      'Nomor NIB': s.umkm.nibNumber,
      'Kecamatan Usaha': toTitleCase(s.umkm.businessKecamatan),
      'Kabupaten/Kota Usaha': toTitleCase(s.umkm.businessKabupaten),
      'Alamat Usaha': toTitleCase(s.umkm.businessAddress),
      Produk: toTitleCase(product.name),
      'Kategori Produk': toTitleCase(product.category.name),
      'Harga Produk': product.price,
      'Pendamping Ditugaskan': s.pendamping ? toTitleCase(s.pendamping.name) : '-',
      'Kode Fasilitasi': s.fasilitasiCode?.code ?? '-',
      Status: STATUS_LABELS[s.status] ?? s.status,
      'Tanggal Ditugaskan': formatDate(s.createdAt),
    })),
  );
}

export default function Lp3hSertifikasiGratisPage() {
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['lp3h', 'sertifikasi-gratis'],
    queryFn: fetchSubmissions,
    // ditugaskan Admin gak tiap detik berubah - 30 detik cukup buat
    // ngurangin refetch tiap kali halaman ini di-mount ulang / balik dari
    // halaman lain, tanpa bikin datanya kelamaan basi
    staleTime: 30 * 1000,
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // filter per-kolom (pola "kayak Excel")
  const [pendampingFilter, setPendampingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendampingOptions = useMemo(() => {
    const names = Array.from(new Set(submissions.map((s) => s.pendamping?.name).filter((v): v is string => Boolean(v))));
    return names.map((n) => ({ value: n, label: toTitleCase(n) }));
  }, [submissions]);
  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  const filteredSubmissions = submissions.filter((row) => {
    if (pendampingFilter !== 'all' && row.pendamping?.name !== pendampingFilter) return false;
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    return true;
  });

  async function handleExport() {
    if (isExporting || submissions.length === 0) return;
    setIsExporting(true);
    try {
      await exportToExcel(buildExportRows(submissions), 'Self Declare', 'self-declare-lp3h');
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<SubmissionItem>[] = [
    {
      id: 'umkm',
      header: 'UMKM',
      accessor: (row) => <span className="font-medium">{toTitleCase(row.umkm.businessName)}</span>,
      className: 'min-w-[160px]',
      sortKey: (row) => row.umkm.businessName.toLowerCase(),
    },
    {
      id: 'ownerName',
      header: 'Nama Pelaku Usaha',
      accessor: (row) => toTitleCase(row.umkm.ownerName),
      className: 'min-w-[150px] whitespace-nowrap',
    },
    {
      id: 'products',
      header: 'Produk',
      accessor: (row) => (row.products.length === 1 ? toTitleCase(row.products[0].product.name) : `${row.products.length} produk`),
    },
    {
      id: 'pendamping',
      header: <HeaderFilterSelect value={pendampingFilter} onChange={setPendampingFilter} placeholder="Pendamping" options={pendampingOptions} />,
      accessor: (row) => (row.pendamping ? toTitleCase(row.pendamping.name) : '-'),
      className: 'min-w-[150px] whitespace-nowrap',
      sortKey: (row) => row.pendamping?.name.toLowerCase() ?? null,
    },
    {
      id: 'fasilitasiCode',
      header: 'Kode Fasilitasi',
      accessor: (row) => (row.fasilitasiCode ? <span className="font-mono text-xs font-semibold text-primary">{row.fasilitasiCode.code}</span> : <span className="text-xs text-muted-foreground">-</span>),
      className: 'whitespace-nowrap',
    },
    {
      id: 'status',
      header: <HeaderFilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={statusOptions} />,
      accessor: (row) => <Badge variant={STATUS_VARIANTS[row.status] ?? 'secondary'}>{STATUS_LABELS[row.status] ?? row.status}</Badge>,
      className: 'min-w-[150px] whitespace-nowrap',
    },
    {
      id: 'createdAt',
      header: 'Ditugaskan',
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
    return (
      row.umkm.businessName.toLowerCase().includes(q) ||
      row.umkm.ownerName.toLowerCase().includes(q) ||
      row.products.some((p) => p.product.name.toLowerCase().includes(q)) ||
      (row.pendamping?.name.toLowerCase().includes(q) ?? false) ||
      (row.fasilitasiCode?.code.toLowerCase().includes(q) ?? false) ||
      (STATUS_LABELS[row.status] ?? row.status).toLowerCase().includes(q)
    );
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
          <p className="text-sm text-muted-foreground">Daftar pengajuan yang ditugaskan Admin ke lembaga anda untuk proses pendampingan.</p>
        </div>

        <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || submissions.length === 0} className="w-full sm:w-auto">
          <FileSpreadsheet className="size-4" />
          {isExporting ? 'Menyiapkan...' : 'Export Excel'}
        </Button>
      </div>

      <DataTable
        data={filteredSubmissions}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari UMKM atau produk..."
        isLoading={isLoading}
        emptyMessage="Tidak ada pengajuan yang cocok dengan filter/pencarian."
      />

      <Lp3hSertifikasiGratisDetailSheet submissionId={selectedId} onOpenChange={(open) => !open && setSelectedId(null)} />
    </div>
  );
}
