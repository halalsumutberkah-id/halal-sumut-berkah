// app/admin/(dashboard)/sertifikasi-gratis/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, ShieldCheck, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { VerifySertifikasiGratisDialog, type VerifySubmissionRecord } from '@/components/admin/sertifikasi-gratis/verify-sertifikasi-gratis-dialog';
import { CompleteSertifikasiGratisDialog, type CompleteSubmissionRecord } from '@/components/admin/sertifikasi-gratis/complete-sertifikasi-gratis-dialog';

interface SubmissionItem {
  id: string;
  status: string;
  createdAt: string;
  adminNote: string | null;
  updatedAt: string;
  halalCertNumber: string | null;
  halalCertUrl: string | null;
  umkm: {
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
    nibNumber: string;
    nibUrl: string | null;
    establishedYear: number;
    businessKecamatan: string;
    businessKabupaten: string;
    businessAddress: string;
    businessType: string;
    annualRevenue: string;
    businessContactNumber: string | null;
    businessCategory: { name: string };
  };
  products: { product: { name: string; price: number; halalStatus: string; category: { name: string } } }[];
  lp3h: { name: string } | null;
  pendamping: { name: string } | null;
  fasilitasiCode: { code: string } | null;
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

async function fetchSubmissions(): Promise<SubmissionItem[]> {
  const res = await fetch('/api/admin/sertifikasi-gratis');
  const data = await res.json();
  return data.data || [];
}

// data mentah, SEMUA field yang ada di database (bukan cuma yang
// tampil di tabel), 1 baris per produk (bukan di-flatten "3 produk")
// biar bisa difilter/di-sort bebas langsung di Excel oleh admin
function buildExportRows(submissions: SubmissionItem[]) {
  return submissions.flatMap((s) =>
    s.products.map(({ product }) => ({
      'ID Pengajuan': s.id,
      UMKM: toTitleCase(s.umkm.businessName),
      'Nama Pelaku Usaha': toTitleCase(s.umkm.ownerName),
      'NIK Pelaku Usaha': s.umkm.ownerNik || '-',
      'Jenis Kelamin Pelaku Usaha': s.umkm.ownerGender === 'L' ? 'Laki-laki' : s.umkm.ownerGender === 'P' ? 'Perempuan' : '-',
      'Tanggal Lahir Pelaku Usaha': s.umkm.birthDate ? formatDate(s.umkm.birthDate) : '-',
      'Nomor HP Pelaku Usaha': s.umkm.ownerPhone,
      'Kecamatan Pemilik': toTitleCase(s.umkm.ownerKecamatan),
      'Kabupaten/Kota Pemilik': toTitleCase(s.umkm.ownerKabupaten),
      'Alamat Pemilik': toTitleCase(s.umkm.ownerAddress),
      'Dokumen KTP': s.umkm.ktpUrl || '-',
      'Kategori Usaha': toTitleCase(s.umkm.businessCategory.name),
      'Jenis Usaha': s.umkm.businessType,
      'Tahun Berdiri Usaha': s.umkm.establishedYear,
      'Nomor NIB': s.umkm.nibNumber,
      'Dokumen NIB': s.umkm.nibUrl || '-',
      'Omset Tahunan': s.umkm.annualRevenue,
      'Kontak Usaha': s.umkm.businessContactNumber || '-',
      'Kecamatan Usaha': toTitleCase(s.umkm.businessKecamatan),
      'Kabupaten/Kota Usaha': toTitleCase(s.umkm.businessKabupaten),
      'Alamat Usaha': toTitleCase(s.umkm.businessAddress),
      Produk: toTitleCase(product.name),
      'Kategori Produk': toTitleCase(product.category.name),
      'Harga Produk': product.price,
      'Status Halal Produk': product.halalStatus,
      LP3H: s.lp3h ? toTitleCase(s.lp3h.name) : '-',
      Pendamping: s.pendamping ? toTitleCase(s.pendamping.name) : '-',
      'Kode Fasilitasi': s.fasilitasiCode?.code ?? '-',
      Status: STATUS_LABELS[s.status] ?? s.status,
      'Catatan Verifikasi': s.adminNote || '-',
      'Nomor Sertifikat Halal': s.halalCertNumber || '-',
      'Dokumen Sertifikat Halal': s.halalCertUrl || '-',
      'Tanggal Diajukan': formatDate(s.createdAt),
      'Terakhir Diperbarui': formatDate(s.updatedAt),
    })),
  );
}

async function exportSubmissionsToExcel(submissions: SubmissionItem[]) {
  await exportToExcel(buildExportRows(submissions), 'Self Declare', 'self-declare');
}

export default function AdminSertifikasiGratisPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin', 'sertifikasi-gratis'],
    queryFn: fetchSubmissions,
    staleTime: 30 * 1000,
  });

  const [verifying, setVerifying] = useState<VerifySubmissionRecord | null>(null);
  const [completing, setCompleting] = useState<CompleteSubmissionRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // filter per-kolom (pola "kayak Excel")
  const [lp3hFilter, setLp3hFilter] = useState('all');
  const [pendampingFilter, setPendampingFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const lp3hOptions = useMemo(() => {
    const names = Array.from(new Set(submissions.map((s) => s.lp3h?.name).filter((v): v is string => Boolean(v))));
    return names.map((n) => ({ value: n, label: toTitleCase(n) }));
  }, [submissions]);
  const pendampingOptions = useMemo(() => {
    const names = Array.from(new Set(submissions.map((s) => s.pendamping?.name).filter((v): v is string => Boolean(v))));
    return names.map((n) => ({ value: n, label: toTitleCase(n) }));
  }, [submissions]);
  const statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  const filteredSubmissions = submissions.filter((row) => {
    if (lp3hFilter !== 'all' && row.lp3h?.name !== lp3hFilter) return false;
    if (pendampingFilter !== 'all' && row.pendamping?.name !== pendampingFilter) return false;
    if (statusFilter !== 'all' && row.status !== statusFilter) return false;
    return true;
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'sertifikasi-gratis'] });
  }

  async function handleExport() {
    if (isExporting || submissions.length === 0) return;
    setIsExporting(true);
    try {
      await exportSubmissionsToExcel(submissions);
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
      sortKey: (row) => row.umkm.ownerName.toLowerCase(),
    },
    {
      id: 'products',
      header: 'Produk',
      accessor: (row) => (row.products.length === 1 ? toTitleCase(row.products[0].product.name) : `${row.products.length} produk`),
    },
    {
      id: 'lp3h',
      header: <HeaderFilterSelect value={lp3hFilter} onChange={setLp3hFilter} placeholder="LP3H" options={lp3hOptions} />,
      accessor: (row) => (row.lp3h ? toTitleCase(row.lp3h.name) : '-'),
      className: 'min-w-[150px] whitespace-nowrap',
    },
    {
      id: 'pendamping',
      header: <HeaderFilterSelect value={pendampingFilter} onChange={setPendampingFilter} placeholder="Pendamping" options={pendampingOptions} />,
      accessor: (row) => (row.pendamping ? toTitleCase(row.pendamping.name) : '-'),
      className: 'min-w-[150px] whitespace-nowrap',
    },
    {
      id: 'fasilitasiCode',
      header: 'Kode Fasilitasi',
      accessor: (row) => (row.fasilitasiCode ? <span className="font-mono text-xs">{row.fasilitasiCode.code}</span> : <span className="text-xs text-muted-foreground">-</span>),
      className: 'whitespace-nowrap',
    },
    {
      id: 'status',
      header: <HeaderFilterSelect value={statusFilter} onChange={setStatusFilter} placeholder="Status" options={statusOptions} />,
      accessor: (row) => <Badge variant={STATUS_VARIANTS[row.status] ?? 'secondary'}>{STATUS_LABELS[row.status] ?? row.status}</Badge>,
      className: 'min-w-[160px] whitespace-nowrap',
    },
    {
      id: 'adminNote',
      header: 'Catatan',
      accessor: (row) => (row.status === 'ditolak' && row.adminNote ? <span className="text-xs text-destructive">{row.adminNote}</span> : <span className="text-xs text-muted-foreground">-</span>),
      className: 'max-w-60',
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
      onClick: (row) => router.push(`/admin/sertifikasi-gratis/${row.id}`),
    },
    {
      label: 'Verifikasi',
      icon: ShieldCheck,
      hidden: (row) => row.status !== 'menunggu_verifikasi',
      onClick: (row) => setVerifying(row),
    },
    {
      label: 'Tandai Selesai',
      icon: CheckCircle2,
      hidden: (row) => row.status !== 'ditugaskan',
      onClick: (row) => setCompleting(row),
    },
  ];

  function searchFn(row: SubmissionItem, query: string) {
    const q = query.toLowerCase();
    return (
      row.umkm.businessName.toLowerCase().includes(q) ||
      row.umkm.ownerName.toLowerCase().includes(q) ||
      row.products.some((p) => p.product.name.toLowerCase().includes(q)) ||
      (row.lp3h?.name.toLowerCase().includes(q) ?? false) ||
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Self Declare</h1>
          <p className="text-sm text-muted-foreground">Verifikasi pengajuan dari UMKM, tugaskan LP3H dan Pendamping, lalu tandai selesai setelah sertifikat halal terbit.</p>
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

      <VerifySertifikasiGratisDialog submission={verifying} onOpenChange={(open) => !open && setVerifying(null)} onSuccess={invalidate} />

      <CompleteSertifikasiGratisDialog submission={completing} onOpenChange={(open) => !open && setCompleting(null)} onSuccess={invalidate} />
    </div>
  );
}
