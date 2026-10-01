// app/umkm/(dashboard)/products/page.tsx

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Eye, ShieldAlert, ShieldCheck, Clock, Award, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toTitleCase } from '@/lib/title-case';
import { formatRupiah, formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { ProductFormDialog, type ProductRecord } from '@/components/umkm/products/product-form-dialog';
import { DeleteProductDialog } from '@/components/umkm/products/delete-product-dialog';
import { ProductDetailSheet } from '@/components/umkm/products/product-detail-sheet';

interface Category {
  id: string;
  name: string;
}

interface ProductListItem extends ProductRecord {
  halalStatus: string;
  verificationStatus: string;
  isPublished: boolean;
  createdAt: string;
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
  const res = await fetch('/api/umkm/products');
  if (!res.ok) throw new Error('Gagal memuat daftar produk');
  const data = await res.json();
  return data.data || [];
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/public/categories');
  const data = await res.json();
  return data.data || [];
}

interface EligibleProduct {
  id: string;
}

// dipakai buat nentuin tombol "Ajukan Sertifikasi Halal" muncul atau
// tidak - endpoint ini SUDAH filter produk yang belum_halal DAN belum
// ada pengajuan aktif (menunggu_verifikasi/ditugaskan di Daftar Mandiri
// ATAU Sertifikasi Gratis). Jadi kalau list ini kosong, berarti semua
// produk belum-halal sudah dalam proses pengajuan - tombol wajib
// disembunyikan biar UMKM gak ngira belum ada tindakan sama sekali
async function fetchEligibleProducts(): Promise<EligibleProduct[]> {
  const res = await fetch('/api/umkm/sertifikasi-gratis/eligible-products');
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

// dropdown filter kecil dipakai di head kolom. h-7 + border-none biar
// nyatu sama header, tapi tetep keliatan sebagai control (ada chevron
// dari SelectTrigger bawaan).
function HeaderFilterSelect({ value, onChange, placeholder, options }: { value: string; onChange: (v: string) => void; placeholder: string; options: { value: string; label: string }[] }) {
  const activeLabel = options.find((o) => o.value === value)?.label;
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? 'all')}>
      <SelectTrigger className="h-7 w-auto max-w-35 justify-start gap-1 border-none bg-transparent px-1 text-xs font-medium shadow-none hover:bg-muted/50 sm:max-w-none">
        <SelectValue className="truncate">{value === 'all' ? placeholder : activeLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua {placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function UmkmProductsPage() {
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['umkm', 'products'],
    queryFn: fetchProducts,
    staleTime: 30 * 1000,
  });

  // kategori produk nyaris gak pernah berubah - pakai useQuery dengan
  // staleTime panjang, dulu di-fetch ulang tiap kali halaman ini
  // di-mount pakai useEffect+useState biasa tanpa cache sama sekali
  const { data: categories = [] } = useQuery({
    queryKey: ['public', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  // dipakai KHUSUS buat visibility tombol "Ajukan Sertifikasi Halal" di
  // bawah - staleTime pendek karena statusnya berubah begitu UMKM
  // submit atau Admin verifikasi
  const { data: eligibleProducts = [] } = useQuery({
    queryKey: ['umkm', 'sertifikasi-gratis', 'eligible-products'],
    queryFn: fetchEligibleProducts,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<ProductRecord | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // filter per-kolom (ganti select tunggal verifikasi sebelumnya)
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [halalFilter, setHalalFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [pubFilter, setPubFilter] = useState('all');

  const categoryOptions = useMemo(() => {
    const names = Array.from(new Set(products.map((p) => p.category.name)));
    return names.map((n) => ({ value: n, label: formatProductName(n) }));
  }, [products]);

  const halalOptions = Object.entries(HALAL_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const verificationOptions = Object.entries(VERIFICATION_STATUS_LABELS).map(([value, label]) => ({ value, label }));
  const pubOptions = [
    { value: 'yes', label: 'Sudah Publish' },
    { value: 'no', label: 'Belum Publish' },
  ];

  const filteredProducts = products.filter((row) => {
    if (categoryFilter !== 'all' && row.category.name !== categoryFilter) return false;
    if (halalFilter !== 'all' && row.halalStatus !== halalFilter) return false;
    if (verificationFilter !== 'all' && row.verificationStatus !== verificationFilter) return false;
    if (pubFilter === 'yes' && !row.isPublished) return false;
    if (pubFilter === 'no' && row.isPublished) return false;
    return true;
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['umkm', 'products'] });
  }

  // tombol cuma muncul kalau ADA produk yang beneran eligible (belum
  // halal DAN belum ada pengajuan aktif) - bukan sekadar cek
  // halalStatus === 'belum_halal', karena produk yang statusnya belum
  // halal tapi SUDAH diajukan (menunggu_verifikasi/ditugaskan) tidak
  // boleh ditawari ajuin lagi
  const hasEligibleProduct = eligibleProducts.length > 0;

  const columns: DataTableColumn<ProductListItem>[] = [
    {
      id: 'name',
      header: 'Nama Produk',
      accessor: (row) => <span className="font-medium">{formatProductName(row.name)}</span>,
      className: 'min-w-[160px]',
      sortKey: (row) => row.name.toLowerCase(),
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
      header: <HeaderFilterSelect value={halalFilter} onChange={setHalalFilter} placeholder="Status Halal" options={halalOptions} />,
      className: 'min-w-[150px] whitespace-nowrap',
      accessor: (row) => {
        if (row.halalStatus === 'belum_halal') {
          return (
            <Badge variant="outline" className="gap-1 border-amber-500/40 bg-amber-500/10 text-amber-700 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-300">
              <ShieldAlert className="size-3.5" />
              Belum Halal
            </Badge>
          );
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
            return <Badge variant="destructive">Halal (Ditolak Admin)</Badge>;
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
      header: <HeaderFilterSelect value={verificationFilter} onChange={setVerificationFilter} placeholder="Verifikasi Admin" options={verificationOptions} />,
      className: 'min-w-[160px] whitespace-nowrap',
      accessor: (row) => (
        <Badge variant={row.verificationStatus === 'terverifikasi' ? 'default' : row.verificationStatus === 'ditolak' ? 'destructive' : 'secondary'}>{VERIFICATION_STATUS_LABELS[row.verificationStatus] ?? row.verificationStatus}</Badge>
      ),
    },
    {
      id: 'isPublished',
      header: <HeaderFilterSelect value={pubFilter} onChange={setPubFilter} placeholder="Publikasi" options={pubOptions} />,
      className: 'min-w-[130px] whitespace-nowrap',
      accessor: (row) => <Badge variant={row.isPublished ? 'default' : 'outline'}>{row.isPublished ? 'Sudah Publish' : 'Belum Publish'}</Badge>,
    },
  ];

  const actions: DataTableAction<ProductListItem>[] = [
    {
      label: 'Lihat Detail',
      icon: Eye,
      onClick: (row) => setSelectedProductId(row.id),
    },
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        setEditingProduct(row);
        setFormOpen(true);
      },
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingProduct(row),
    },
  ];

  function searchFn(row: ProductListItem, query: string) {
    return row.name.toLowerCase().includes(query.toLowerCase());
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
          <h1 className="text-xl font-semibold text-foreground">E-Catalog - Data Produk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Kelola daftar produk usaha Anda. Produk akan diverifikasi oleh Admin sebelum dapat dipublikasikan ke katalog publik.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            onClick={() => {
              setEditingProduct(null);
              setFormOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="size-4" />
            Tambah Produk
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredProducts}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama produk..."
        isLoading={isLoading}
        emptyMessage="Belum ada produk. Klik 'Tambah Produk' untuk mulai."
        emptySearchMessage="Tidak ada produk yang cocok dengan filter/pencarian."
      />

      {hasEligibleProduct && (
        <div className="flex justify-end">
          <Button
            render={
              <Link href="/umkm/sertifikasi-gratis?ajukan=1">
                <Award className="size-4" />
                Ajukan Sertifikasi Halal (Gratis)
                <ArrowRight className="size-4" />
              </Link>
            }
            nativeButton={false}
            className="w-full bg-amber-600 text-white hover:bg-amber-700 sm:w-auto dark:bg-amber-500 dark:hover:bg-amber-600"
          />
        </div>
      )}

      <ProductFormDialog open={formOpen} onOpenChange={setFormOpen} product={editingProduct} categories={categories} onSuccess={invalidate} />

      <DeleteProductDialog product={deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)} onDeleted={invalidate} />

      <ProductDetailSheet productId={selectedProductId} onOpenChange={(open) => !open && setSelectedProductId(null)} />
    </div>
  );
}
