// app/admin/umkm/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Eye, FileSpreadsheet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';

interface UmkmListItem {
  id: string;
  slug: string;
  businessName: string;
  ownerName: string;
  ownerNik: string | null;
  ownerGender: string | null;
  birthDate: string | null;
  ownerPhone: string;
  ownerKecamatan: string;
  ownerKabupaten: string;
  ownerAddress: string;
  ktpUrl: string | null;
  logoUrl: string | null;
  nibNumber: string;
  nibUrl: string | null;
  establishedYear: number;
  businessKecamatan: string;
  businessKabupaten: string;
  businessAddress: string;
  businessType: string;
  annualRevenue: string;
  businessContactNumber: string | null;
  createdAt: string;
  businessCategory: { name: string };
  user: { email: string };
  _count: { products: number };
}

function formatBusinessName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\bpt\b/gi, 'PT')
    .replace(/\bcv\b/gi, 'CV')
    .replace(/\bud\b/gi, 'UD')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchUmkmList(): Promise<UmkmListItem[]> {
  const res = await fetch('/api/admin/umkm');
  if (!res.ok) throw new Error('Gagal memuat daftar UMKM');
  const data = await res.json();
  return data.data || [];
}

// data mentah, 1 baris per UMKM, biar bisa difilter/di-sort bebas
// langsung di Excel
// data mentah, SEMUA field yang ada di database (bukan cuma yang
// tampil di tabel) - biar bisa difilter/dianalisis bebas langsung di
// Excel oleh admin
function buildExportRows(umkmList: UmkmListItem[]) {
  return umkmList.map((row) => ({
    'Nama Usaha': formatBusinessName(row.businessName),
    Slug: row.slug,
    Email: row.user.email,
    Kategori: formatBusinessName(row.businessCategory.name),
    'Jenis Usaha': row.businessType,
    'Tahun Berdiri': row.establishedYear,
    'Nomor NIB': row.nibNumber,
    'Dokumen NIB': row.nibUrl || '-',
    'Logo Usaha': row.logoUrl || '-',
    'Omset Tahunan': row.annualRevenue,
    'Kontak Usaha': row.businessContactNumber || '-',
    'Kecamatan Usaha': toTitleCase(row.businessKecamatan),
    'Kabupaten/Kota Usaha': toTitleCase(row.businessKabupaten),
    'Alamat Usaha': toTitleCase(row.businessAddress),
    'Nama Pemilik': toTitleCase(row.ownerName),
    'NIK Pemilik': row.ownerNik || '-',
    'Jenis Kelamin Pemilik': row.ownerGender === 'L' ? 'Laki-laki' : row.ownerGender === 'P' ? 'Perempuan' : '-',
    'Tanggal Lahir Pemilik': row.birthDate ? formatDate(row.birthDate) : '-',
    'Nomor HP Pemilik': row.ownerPhone,
    'Kecamatan Pemilik': toTitleCase(row.ownerKecamatan),
    'Kabupaten/Kota Pemilik': toTitleCase(row.ownerKabupaten),
    'Alamat Pemilik': toTitleCase(row.ownerAddress),
    'Dokumen KTP': row.ktpUrl || '-',
    'Jumlah Produk': row._count.products,
    'Tanggal Terdaftar': formatDate(row.createdAt),
  }));
}

export default function AdminUmkmPage() {
  const router = useRouter();

  const { data: umkmList = [], isLoading } = useQuery({
    queryKey: ['admin', 'umkm'],
    queryFn: fetchUmkmList,
    staleTime: 30 * 1000,
  });

  const [isExporting, setIsExporting] = useState(false);

  // filter per-kolom (pola "kayak Excel")
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [kabupatenFilter, setKabupatenFilter] = useState('all');

  const categoryOptions = useMemo(() => {
    const names = Array.from(new Set(umkmList.map((u) => u.businessCategory.name)));
    return names.map((n) => ({ value: n, label: formatBusinessName(n) }));
  }, [umkmList]);
  const kabupatenOptions = useMemo(() => {
    const names = Array.from(new Set(umkmList.map((u) => u.businessKabupaten)));
    return names.map((n) => ({ value: n, label: toTitleCase(n) }));
  }, [umkmList]);

  const filteredList = umkmList.filter((row) => {
    if (categoryFilter !== 'all' && row.businessCategory.name !== categoryFilter) return false;
    if (kabupatenFilter !== 'all' && row.businessKabupaten !== kabupatenFilter) return false;
    return true;
  });

  async function handleExport() {
    if (isExporting || umkmList.length === 0) return;
    setIsExporting(true);
    try {
      await exportToExcel(buildExportRows(umkmList), 'UMKM', 'umkm');
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<UmkmListItem>[] = [
    {
      id: 'businessName',
      header: 'Nama Usaha',
      accessor: (row) => <span className="font-medium">{formatBusinessName(row.businessName)}</span>,
      className: 'min-w-[180px]',
      sortKey: (row) => row.businessName.toLowerCase(),
    },
    {
      id: 'ownerName',
      header: 'Pemilik',
      accessor: (row) => toTitleCase(row.ownerName),
      sortKey: (row) => row.ownerName.toLowerCase(),
    },
    {
      id: 'category',
      header: <HeaderFilterSelect value={categoryFilter} onChange={setCategoryFilter} placeholder="Kategori" options={categoryOptions} />,
      accessor: (row) => <Badge className="border-0 bg-indigo-600 font-medium text-white shadow-none hover:bg-indigo-600 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-500">{formatBusinessName(row.businessCategory.name)}</Badge>,
      className: 'min-w-[150px] whitespace-nowrap',
      sortKey: (row) => row.businessCategory.name.toLowerCase(),
    },
    {
      id: 'kabupaten',
      header: <HeaderFilterSelect value={kabupatenFilter} onChange={setKabupatenFilter} placeholder="Kab/Kota" options={kabupatenOptions} />,
      accessor: (row) => toTitleCase(row.businessKabupaten),
      className: 'min-w-[140px] whitespace-nowrap',
      sortKey: (row) => row.businessKabupaten.toLowerCase(),
    },
    {
      id: 'products',
      header: 'Produk',
      accessor: (row) => row._count.products,
      sortKey: (row) => row._count.products,
    },
    {
      id: 'createdAt',
      header: 'Terdaftar',
      accessor: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>,
      className: 'whitespace-nowrap',
      sortKey: (row) => new Date(row.createdAt),
    },
  ];

  const actions: DataTableAction<UmkmListItem>[] = [
    {
      label: 'Lihat Detail',
      icon: Eye,
      onClick: (row) => router.push(`/admin/umkm/${row.id}`),
    },
  ];

  function searchFn(row: UmkmListItem, query: string) {
    const q = query.toLowerCase();
    return row.businessName.toLowerCase().includes(q) || row.ownerName.toLowerCase().includes(q) || row.user.email.toLowerCase().includes(q);
  }

  function sortFn(rows: UmkmListItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.businessName.localeCompare(b.businessName);
        case 'za':
          return b.businessName.localeCompare(a.businessName);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">UMKM Terdaftar</h1>
          <p className="text-sm text-muted-foreground">Pantau seluruh UMKM yang terdaftar di platform beserta produk mereka.</p>
        </div>

        <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || umkmList.length === 0} className="w-full sm:w-auto">
          <FileSpreadsheet className="size-4" />
          {isExporting ? 'Menyiapkan...' : 'Export Excel'}
        </Button>
      </div>

      <DataTable
        data={filteredList}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama usaha, pemilik, atau email..."
        isLoading={isLoading}
        emptyMessage="Tidak ada UMKM yang cocok dengan filter/pencarian."
      />
    </div>
  );
}
