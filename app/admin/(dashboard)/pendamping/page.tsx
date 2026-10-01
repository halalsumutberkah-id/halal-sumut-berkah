// app/admin/(dashboard)/pendamping/page.tsx

'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Eye, Pencil, Trash2, ShieldCheck, FileSpreadsheet, Briefcase } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { exportToExcel } from '@/lib/export-excel';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { PendampingFormDialog, type PendampingRecord } from '@/components/lp3h/pendamping/pendamping-form-dialog';
import { DeletePendampingDialog } from '@/components/lp3h/pendamping/delete-pendamping-dialog';
import { VerifyPendampingDialog } from '@/components/admin/pendamping/verify-pendamping-dialog';

interface PendampingListItem extends PendampingRecord {
  createdAt: string;
  lp3h: { name: string };
  verificationStatus: string;
  adminNote: string | null;
  _count: { sertifikasiGratisSubmissions: number };
}

const VERIFICATION_LABELS: Record<string, string> = {
  pending: 'Menunggu Verifikasi',
  terverifikasi: 'Terverifikasi',
  ditolak: 'Ditolak',
};

const VERIFICATION_VARIANTS: Record<string, 'secondary' | 'default' | 'destructive'> = {
  pending: 'secondary',
  terverifikasi: 'default',
  ditolak: 'destructive',
};

function formatEntityName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bp3h\b/gi, 'P3H')
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchPendampingList(): Promise<PendampingListItem[]> {
  const res = await fetch('/api/admin/pendamping');
  if (!res.ok) throw new Error('Gagal memuat daftar Pendamping');
  const data = await res.json();
  return data.data || [];
}

// data mentah, 1 baris per pendamping, biar bisa difilter/di-sort bebas
// langsung di Excel
// data mentah, SEMUA field yang ada di database (bukan cuma yang
// tampil di tabel)
function buildExportRows(pendampingList: PendampingListItem[]) {
  return pendampingList.map((row) => ({
    Nama: toTitleCase(row.name),
    LP3H: formatEntityName(row.lp3h.name),
    'Nomor HP': row.phone,
    Email: row.emailP3h || '-',
    NIK: row.nikP3h || '-',
    'Jenis Kelamin': row.jenisKelamin === 'L' ? 'Laki-laki' : row.jenisKelamin === 'P' ? 'Perempuan' : '-',
    Kecamatan: row.kecamatan ? formatEntityName(row.kecamatan) : '-',
    'Kabupaten/Kota': row.kabupaten ? formatEntityName(row.kabupaten) : '-',
    'Alamat Detail': row.alamatDetail ? formatEntityName(row.alamatDetail) : '-',
    'Foto Profil': row.photoUrl || '-',
    'Dokumen KTP': row.ktpUrl || '-',
    'Bukti Registrasi SIHALAL': row.registrasiSihalalUrl || '-',
    'Dokumen Registrasi BPJPH': row.registrasiBpjphUrl || '-',
    'Sertifikat Pelatihan P3H': row.sertifikatPelatihanUrl || '-',
    'Beban Kerja (UMKM Aktif)': row._count.sertifikasiGratisSubmissions,
    'Status Verifikasi': VERIFICATION_LABELS[row.verificationStatus] ?? row.verificationStatus,
    'Catatan Verifikasi': row.adminNote || '-',
    'Tanggal Dibuat': formatDate(row.createdAt),
  }));
}

export default function AdminPendampingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: pendampingList = [], isLoading } = useQuery({
    queryKey: ['admin', 'pendamping'],
    queryFn: fetchPendampingList,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingPendamping, setEditingPendamping] = useState<PendampingListItem | null>(null);
  const [deletingPendamping, setDeletingPendamping] = useState<PendampingRecord | null>(null);
  const [verifyingPendamping, setVerifyingPendamping] = useState<PendampingListItem | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // filter per-kolom (pola "kayak Excel") - dropdown di head masing2
  // kolom, nama sudah bisa dicari lewat search box bawaan DataTable
  const [lp3hFilter, setLp3hFilter] = useState('all');
  const [kabupatenFilter, setKabupatenFilter] = useState('all');
  const [kecamatanFilter, setKecamatanFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');

  const lp3hOptions = useMemo(() => {
    const names = Array.from(new Set(pendampingList.map((p) => p.lp3h.name)));
    return names.map((n) => ({ value: n, label: formatEntityName(n) }));
  }, [pendampingList]);
  const kabupatenOptions = useMemo(() => {
    const names = Array.from(new Set(pendampingList.map((p) => p.kabupaten).filter((v): v is string => Boolean(v))));
    return names.map((n) => ({ value: n, label: formatEntityName(n) }));
  }, [pendampingList]);
  const kecamatanOptions = useMemo(() => {
    const names = Array.from(new Set(pendampingList.map((p) => p.kecamatan).filter((v): v is string => Boolean(v))));
    return names.map((n) => ({ value: n, label: formatEntityName(n) }));
  }, [pendampingList]);
  const verificationOptions = Object.entries(VERIFICATION_LABELS).map(([value, label]) => ({ value, label }));

  const filteredList = pendampingList.filter((row) => {
    if (lp3hFilter !== 'all' && row.lp3h.name !== lp3hFilter) return false;
    if (kabupatenFilter !== 'all' && row.kabupaten !== kabupatenFilter) return false;
    if (kecamatanFilter !== 'all' && row.kecamatan !== kecamatanFilter) return false;
    if (verificationFilter !== 'all' && row.verificationStatus !== verificationFilter) return false;
    return true;
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'pendamping'] });
  }

  async function handleExport() {
    if (isExporting || pendampingList.length === 0) return;
    setIsExporting(true);
    try {
      await exportToExcel(buildExportRows(pendampingList), 'Pendamping', 'pendamping');
    } finally {
      setIsExporting(false);
    }
  }

  const columns: DataTableColumn<PendampingListItem>[] = [
    {
      id: 'name',
      header: 'Nama',
      accessor: (row) => <span className="font-medium">{toTitleCase(row.name)}</span>,
      className: 'min-w-[160px]',
      sortKey: (row) => row.name.toLowerCase(),
    },
    {
      id: 'lp3h',
      header: <HeaderFilterSelect value={lp3hFilter} onChange={setLp3hFilter} placeholder="LP3H" options={lp3hOptions} />,
      accessor: (row) => formatEntityName(row.lp3h.name),
      className: 'min-w-[150px] whitespace-nowrap',
      sortKey: (row) => row.lp3h.name.toLowerCase(),
    },
    {
      id: 'phone',
      header: 'Nomor HP',
      accessor: (row) => row.phone,
      className: 'whitespace-nowrap',
    },
    {
      id: 'kecamatan',
      header: <HeaderFilterSelect value={kecamatanFilter} onChange={setKecamatanFilter} placeholder="Kecamatan" options={kecamatanOptions} />,
      accessor: (row) => (row.kecamatan ? formatEntityName(row.kecamatan) : '-'),
      className: 'min-w-[140px] whitespace-nowrap',
    },
    {
      id: 'kabupaten',
      header: <HeaderFilterSelect value={kabupatenFilter} onChange={setKabupatenFilter} placeholder="Kabupaten/Kota" options={kabupatenOptions} />,
      accessor: (row) => (row.kabupaten ? formatEntityName(row.kabupaten) : '-'),
      className: 'min-w-[150px] whitespace-nowrap',
    },
    {
      id: 'workload',
      header: 'Beban Kerja',
      accessor: (row) => (
        <Badge variant="outline" className="gap-1">
          <Briefcase className="size-3" />
          {row._count.sertifikasiGratisSubmissions} UMKM
        </Badge>
      ),
      sortKey: (row) => row._count.sertifikasiGratisSubmissions,
    },
    {
      id: 'verificationStatus',
      header: <HeaderFilterSelect value={verificationFilter} onChange={setVerificationFilter} placeholder="Status Verifikasi" options={verificationOptions} />,
      accessor: (row) => <Badge variant={VERIFICATION_VARIANTS[row.verificationStatus] ?? 'secondary'}>{VERIFICATION_LABELS[row.verificationStatus] ?? row.verificationStatus}</Badge>,
      className: 'min-w-[170px] whitespace-nowrap',
    },
    {
      id: 'adminNote',
      header: 'Catatan',
      accessor: (row) => (row.verificationStatus === 'ditolak' && row.adminNote ? <span className="text-xs text-destructive">{row.adminNote}</span> : <span className="text-xs text-muted-foreground">-</span>),
      className: 'max-w-60',
    },
  ];

  const actions: DataTableAction<PendampingListItem>[] = [
    {
      label: 'Lihat Detail',
      icon: Eye,
      onClick: (row) => router.push(`/admin/pendamping/${row.id}`),
    },
    {
      label: 'Verifikasi',
      icon: ShieldCheck,
      hidden: (row) => row.verificationStatus === 'terverifikasi',
      onClick: (row) => setVerifyingPendamping(row),
    },
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        setEditingPendamping(row);
        setFormOpen(true);
      },
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingPendamping(row),
    },
  ];

  function searchFn(row: PendampingListItem, query: string) {
    const q = query.toLowerCase();
    return row.name.toLowerCase().includes(q) || row.lp3h.name.toLowerCase().includes(q);
  }

  function sortFn(rows: PendampingListItem[], sort: SortOption) {
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
          <h1 className="text-xl font-semibold text-foreground">Data Pendamping (P3H)</h1>
          <p className="text-sm text-muted-foreground">Kelola data seluruh Pendamping dari semua LP3H yang terdaftar.</p>
        </div>

        <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || pendampingList.length === 0} className="w-full sm:w-auto">
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
        searchPlaceholder="Cari nama pendamping atau LP3H..."
        isLoading={isLoading}
        emptyMessage="Tidak ada Pendamping yang cocok dengan filter/pencarian."
      />

      <PendampingFormDialog open={formOpen} onOpenChange={setFormOpen} pendamping={editingPendamping} onSuccess={invalidate} apiBasePath="/api/admin/pendamping" />

      <DeletePendampingDialog pendamping={deletingPendamping} onOpenChange={(open) => !open && setDeletingPendamping(null)} onDeleted={invalidate} apiBasePath="/api/admin/pendamping" />

      <VerifyPendampingDialog pendamping={verifyingPendamping} onOpenChange={(open) => !open && setVerifyingPendamping(null)} onSuccess={invalidate} />
    </div>
  );
}
