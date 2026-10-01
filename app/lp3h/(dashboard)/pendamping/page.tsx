// app/lp3h/(dashboard)/pendamping/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, AlertTriangle, ArrowRight, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { exportToExcel } from '@/lib/export-excel';
import { isLp3hProfileComplete } from '@/lib/lp3h-profile-completeness';
import { HeaderFilterSelect } from '@/components/shared/header-filter-select';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { PendampingFormDialog, type PendampingRecord } from '@/components/lp3h/pendamping/pendamping-form-dialog';
import { DeletePendampingDialog } from '@/components/lp3h/pendamping/delete-pendamping-dialog';

interface PendampingListItem extends PendampingRecord {
  createdAt: string;
  verificationStatus: string;
  adminNote: string | null;
}

interface ProfileCompleteness {
  jenisLembaga: string | null;
  lembagaInduk: string | null;
  officeKecamatan: string | null;
  officeKabupaten: string | null;
  officeAddress: string | null;
  contactEmail: string | null;
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

async function fetchProfileForCompleteness(): Promise<ProfileCompleteness> {
  const res = await fetch('/api/lp3h/profile');
  const data = await res.json();
  return data.data;
}

async function fetchPendampingList(): Promise<PendampingListItem[]> {
  const res = await fetch('/api/lp3h/pendamping');
  if (!res.ok) throw new Error('Gagal memuat daftar Pendamping');
  const data = await res.json();
  return data.data || [];
}

// data mentah, 1 baris per pendamping, biar bisa difilter/di-sort bebas
// langsung di Excel
function buildExportRows(pendampingList: PendampingListItem[]) {
  return pendampingList.map((row) => ({
    Nama: toTitleCase(row.name),
    'Nomor HP': row.phone,
    'Status Verifikasi': VERIFICATION_LABELS[row.verificationStatus] ?? row.verificationStatus,
    'Catatan Admin': row.adminNote || '-',
    'Tanggal Dibuat': formatDate(row.createdAt),
  }));
}

export default function Lp3hPendampingPage() {
  const queryClient = useQueryClient();

  // queryKey SAMA dengan dashboard & halaman profil - cache ke-share
  // lintas halaman kalau masih fresh
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['lp3h', 'profile'],
    queryFn: fetchProfileForCompleteness,
    staleTime: 60 * 1000,
  });

  const { data: pendampingList = [], isLoading } = useQuery({
    queryKey: ['lp3h', 'pendamping'],
    queryFn: fetchPendampingList,
    enabled: !!profile && isLp3hProfileComplete(profile),
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [verificationFilter, setVerificationFilter] = useState('all');
  const verificationOptions = Object.entries(VERIFICATION_LABELS).map(([value, label]) => ({ value, label }));
  const [editingPendamping, setEditingPendamping] = useState<PendampingRecord | null>(null);
  const [deletingPendamping, setDeletingPendamping] = useState<PendampingRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['lp3h', 'pendamping'] });
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
      sortKey: (row) => row.name.toLowerCase(),
    },
    {
      id: 'phone',
      header: 'Nomor HP',
      accessor: (row) => row.phone,
    },
    {
      id: 'verificationStatus',
      header: <HeaderFilterSelect value={verificationFilter} onChange={setVerificationFilter} placeholder="Status Verifikasi" options={verificationOptions} />,
      className: 'min-w-[170px] whitespace-nowrap',
      accessor: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={VERIFICATION_VARIANTS[row.verificationStatus] ?? 'secondary'} className="w-fit">
            {VERIFICATION_LABELS[row.verificationStatus] ?? row.verificationStatus}
          </Badge>
          {row.verificationStatus === 'ditolak' && row.adminNote && <span className="max-w-60 text-xs text-destructive">{row.adminNote}</span>}
        </div>
      ),
    },
  ];

  const actions: DataTableAction<PendampingListItem>[] = [
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
    return row.name.toLowerCase().includes(query.toLowerCase());
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

  if (isProfileLoading) return null;

  if (!profile || !isLp3hProfileComplete(profile)) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-yellow-300 bg-yellow-50 p-10 text-center dark:border-yellow-900 dark:bg-yellow-900/20">
        <AlertTriangle className="size-10 text-yellow-700 dark:text-yellow-500" />
        <div>
          <h2 className="text-base font-semibold text-yellow-900 dark:text-yellow-300">Lengkapi Profil Lembaga Terlebih Dahulu</h2>
          <p className="mt-1 max-w-sm text-sm text-yellow-800/80 dark:text-yellow-400/80">Menu Pendamping baru bisa diakses setelah profil lembaga anda lengkap.</p>
        </div>
        <Button
          render={
            <Link href="/lp3h/profile">
              Lengkapi Profil Sekarang
              <ArrowRight className="size-4" />
            </Link>
          }
          nativeButton={false}
          className="bg-yellow-600 hover:bg-yellow-700"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Pendamping</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar pendamping yang dapat membantu UMKM mengurus sertifikat halal.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={handleExport} disabled={isExporting || isLoading || pendampingList.length === 0} className="w-full sm:w-auto">
            <FileSpreadsheet className="size-4" />
            {isExporting ? 'Menyiapkan...' : 'Export Excel'}
          </Button>
          <Button
            onClick={() => {
              setEditingPendamping(null);
              setFormOpen(true);
            }}
            className="w-full sm:w-auto"
          >
            <Plus className="size-4" />
            Tambah Pendamping
          </Button>
        </div>
      </div>

      <DataTable
        data={pendampingList.filter((row) => verificationFilter === 'all' || row.verificationStatus === verificationFilter)}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama pendamping..."
        isLoading={isLoading}
        emptyMessage="Belum ada Pendamping. Klik 'Tambah Pendamping' untuk mulai."
      />

      <PendampingFormDialog open={formOpen} onOpenChange={setFormOpen} pendamping={editingPendamping} onSuccess={invalidate} />

      <DeletePendampingDialog pendamping={deletingPendamping} onOpenChange={(open) => !open && setDeletingPendamping(null)} onDeleted={invalidate} />
    </div>
  );
}
