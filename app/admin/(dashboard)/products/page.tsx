// app/admin/products/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Eye, ShieldCheck, Clock, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { toTitleCase } from '@/lib/title-case';
import { formatRupiah, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';

interface ProductListItem {
  id: string;
  name: string;
  price: number;
  shortDescription: string | null;
  photoUrl: string | null;
  halalStatus: string;
  halalCertNumber: string | null;
  halalCertUrl: string | null;
  pirtNumber: string | null;
  bpomNumber: string | null;
  hakiNumber: string | null;
  verificationStatus: string;
  isPublished: boolean;
  createdAt: string;
  adminNote: string | null;
  umkm: { businessName: string; ownerName: string };
  category: { name: string };
}

const HALAL_STATUS_LABELS: Record<string, string> = {
  belum_halal: 'Belum Halal',
  proses: 'Proses Sertifikasi',
  halal: 'Halal',
};

const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu Verifikasi',
  terverifikasi: 'Terverifikasi',
  ditolak: 'Ditolak',
};

function formatProductName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\bbpom\b/gi, 'BPOM')
    .replace(/\bpirt\b/gi, 'PIRT')
    .replace(/\bhaki\b/gi, 'HAKI')
    .replace(/\bslhs\b/gi, 'SLHS')
    .replace(/\bpt\b/gi, 'PT')
    .replace(/\bcv\b/gi, 'CV')
    .replace(/\bud\b/gi, 'UD')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchProducts(): Promise<ProductListItem[]> {
  const res = await fetch('/api/admin/products');
  if (!res.ok) throw new Error('Gagal memuat daftar produk');
  const data = await res.json();
  return data.data || [];
}

// data mentah, 1 baris per produk, biar bisa difilter/di-sort bebas
// langsung di Excel
// data mentah, SEMUA field yang ada di database (bukan cuma yang
// tampil di tabel)
function buildExportRows(products: ProductListItem[]) {
  return products.map((row) => ({
    Produk: formatProductName(row.name),
    UMKM: formatProductName(row.umkm.businessName),
    Pemilik: toTitleCase(row.umkm.ownerName),
    Kategori: formatProductName(row.category.name),
    Harga: row.price,
    'Deskripsi Singkat': row.shortDescription || '-',
    'Foto Produk': row.photoUrl || '-',
    'Status Halal': HALAL_STATUS_LABELS[row.halalStatus] ?? row.halalStatus,
    'Nomor Sertifikat Halal': row.halalCertNumber || '-',
    'Dokumen Sertifikat Halal': row.halalCertUrl || '-',
    'Nomor PIRT': row.pirtNumber || '-',
    'Nomor BPOM': row.bpomNumber || '-',
    'Nomor HAKI': row.hakiNumber || '-',
    Verifikasi: VERIFICATION_STATUS_LABELS[row.verificationStatus] ?? row.verificationStatus,
    'Catatan Verifikasi': row.adminNote || '-',
    Publikasi: row.isPublished ? 'Publish' : 'Belum Publish',
    'Tanggal Dibuat': formatDate(row.createdAt),
  }));
}

export default function AdminProductsPage() {
  const router = useRouter();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: fetchProducts,
    staleTime: 30 * 1000,
  });

  // filter per-kolom (pola "kayak Excel") - dropdown ada di head masing2
  // kolom, bukan 1 select gabungan di atas tabel lagi
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [halalStatusFilter, setHalalStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [publishFilter, setPublishFilter] = useState('all');

  const categoryOptions = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category.name)));
    return names.map((n) => ({ value: n, label: formatProductName(n) }));
  }, [products]);

  const halalStatusOptions = Object.entries(HALAL_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const verificationOptions = Object.entries(VERIFICATION_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const publishOptions = [
    { value: 'yes', label: 'Publish' },
    { value: 'no', label: 'Belum Publish' },
  ];

  const filteredProducts = products.filter((row) => {
    if (categoryFilter !== 'all' && row.category.name !== categoryFilter) return false;
    if (halalStatusFilter !== 'all' && row.halalStatus !== halalStatusFilter) return false;
    if (verificationFilter !== 'all' && row.verificationStatus !== verificationFilter) return false;
    if (publishFilter === 'yes' && !row.isPublished) return false;
    if (publishFilter === 'no' && row.isPublished) return false;
    return true;
  });

  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    if (isExporting || products.length === 0) return;
    setIsExporting(true);
    try {
      await exportToExcel(buildExportRows(products), 'Produk', 'produk');
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<ProductListItem>[] = [
    {
      id: 'name',
      header: 'Produk',
      accessor: (row) => <span className="font-medium">{formatProductName(row.name)}</span>,
      className: 'min-w-[160px]',
      sortKey: (row) => row.name.toLowerCase(),
    },
    {
      id: 'umkm',
      header: 'UMKM',
      accessor: (row) => formatProductName(row.umkm.businessName),
      sortKey: (row) => row.umkm.businessName.toLowerCase(),
    },
    {
      id: 'category',
      header: <HeaderFilterSelect value={categoryFilter} onChange={setCategoryFilter} placeholder="Kategori" options={categoryOptions} />,
      accessor: (row) => formatProductName(row.category.name),
      className: 'min-w-[130px] whitespace-nowrap',
      sortKey: (row) => row.category.name.toLowerCase(),
    },
    {
      id: 'price',
      header: 'Harga',
      accessor: (row) => formatRupiah(row.price),
      className: 'whitespace-nowrap',
      sortKey: (row) => row.price,
    },
    {
      id: 'halalStatus',
      header: <HeaderFilterSelect value={halalStatusFilter} onChange={setHalalStatusFilter} placeholder="Status Halal" options={halalStatusOptions} />,
      className: 'min-w-[150px] whitespace-nowrap',
      accessor: (row) => {
        if (row.halalStatus === 'belum_halal') {
          return <Badge variant="secondary">Belum Halal</Badge>;
        }

        if (row.halalStatus === 'halal') {
          if (row.verificationStatus === 'terverifikasi') {
            return (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500">
                <ShieldCheck className="mr-1 size-3.5" />
                Halal
              </Badge>
            );
          }

          if (row.verificationStatus === 'ditolak') {
            return <Badge variant="destructive">Halal (Ditolak)</Badge>;
          }

          return (
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
              <Clock className="mr-1 size-3" />
              Halal (Verifikasi)
            </Badge>
          );
        }

        return <Badge variant="secondary">{HALAL_STATUS_LABELS[row.halalStatus] ?? row.halalStatus}</Badge>;
      },
    },
    {
      id: 'verificationStatus',
      header: <HeaderFilterSelect value={verificationFilter} onChange={setVerificationFilter} placeholder="Verifikasi" options={verificationOptions} />,
      className: 'min-w-[160px] whitespace-nowrap',
      accessor: (row) => (
        <Badge variant={row.verificationStatus === 'terverifikasi' ? 'default' : row.verificationStatus === 'ditolak' ? 'destructive' : 'secondary'}>{VERIFICATION_STATUS_LABELS[row.verificationStatus] ?? row.verificationStatus}</Badge>
      ),
    },
    {
      id: 'adminNote',
      header: 'Catatan',
      accessor: (row) => (row.verificationStatus === 'ditolak' && row.adminNote ? <span className="text-xs text-destructive">{row.adminNote}</span> : <span className="text-xs text-muted-foreground">-</span>),
      className: 'max-w-60',
    },
    {
      id: 'isPublished',
      header: <HeaderFilterSelect value={publishFilter} onChange={setPublishFilter} placeholder="Publikasi" options={publishOptions} />,
      className: 'min-w-[130px] whitespace-nowrap',
      accessor: (row) => <Badge variant={row.isPublished ? 'default' : 'outline'}>{row.isPublished ? 'Publish' : 'Belum Publish'}</Badge>,
    },
  ];

  const actions: DataTableAction<ProductListItem>[] = [
    {
      label: 'Lihat Detail',
      icon: Eye,
      onClick: (row) => router.push(`/admin/products/${row.id}`),
    },
  ];

  function searchFn(row: ProductListItem, query: string) {
    const q = query.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.umkm.businessName.toLowerCase().includes(q);
  }

  function sortFn(rows: ProductListItem[], sort: SortOption) {
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
          <h1 className="text-xl font-semibold text-foreground">Verifikasi Produk</h1>
          <p className="text-sm text-muted-foreground">Periksa kelengkapan dan validitas data produk yang didaftarkan UMKM.</p>
        </div>

        <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || products.length === 0} className="w-full sm:w-auto">
          <FileSpreadsheet className="size-4" />
          {isExporting ? 'Menyiapkan...' : 'Export Excel'}
        </Button>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama produk atau UMKM..."
        isLoading={isLoading}
        emptyMessage="Tidak ada produk yang cocok dengan filter/pencarian."
      />
    </div>
  );
}
