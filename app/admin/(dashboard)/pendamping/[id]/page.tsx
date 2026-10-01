// app/admin/(dashboard)/pendamping/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, FileText, ExternalLink, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PendampingFormDialog, type PendampingRecord } from '@/components/lp3h/pendamping/pendamping-form-dialog';
import { DeletePendampingDialog } from '@/components/lp3h/pendamping/delete-pendamping-dialog';
import { VerifyPendampingDialog } from '@/components/admin/pendamping/verify-pendamping-dialog';

interface PendampingDetail extends PendampingRecord {
  createdAt: string;
  lp3h: { name: string };
  verificationStatus: string;
  adminNote: string | null;
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

async function fetchPendamping(id: string): Promise<PendampingDetail> {
  const res = await fetch(`/api/admin/pendamping/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Data tidak ditemukan');
  return data.data;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function DocumentLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        <FileText className="size-4" />
        {label}: tidak diunggah
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border p-3 text-sm text-primary hover:underline">
      <FileText className="size-4" />
      {label}
      <ExternalLink className="ml-auto size-3.5" />
    </a>
  );
}

export default function AdminPendampingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: pendamping, isLoading } = useQuery({
    queryKey: ['admin', 'pendamping', params.id],
    queryFn: () => fetchPendamping(params.id),
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<PendampingRecord | null>(null);
  const [verifying, setVerifying] = useState<PendampingDetail | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'pendamping', params.id] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'pendamping'] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!pendamping) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={() => router.push('/admin/pendamping')}>
          <ArrowLeft className="size-4" />
          Kembali ke Daftar Pendamping (P3H)
        </Button>

        <div className="flex flex-wrap gap-2">
          {pendamping.verificationStatus !== 'terverifikasi' && (
            <Button variant="outline" onClick={() => setVerifying(pendamping)}>
              <ShieldCheck className="size-4" />
              Verifikasi
            </Button>
          )}
          <Button variant="outline" onClick={() => setFormOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
          <Button variant="outline" onClick={() => setDeleting(pendamping)} className="border-destructive text-destructive hover:bg-destructive/10">
            <Trash2 className="size-4" />
            Hapus
          </Button>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-foreground">{toTitleCase(pendamping.name)}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="secondary">{formatEntityName(pendamping.lp3h.name)}</Badge>
          <Badge variant={VERIFICATION_VARIANTS[pendamping.verificationStatus] ?? 'secondary'}>{VERIFICATION_LABELS[pendamping.verificationStatus] ?? pendamping.verificationStatus}</Badge>
        </div>
      </div>

      {pendamping.adminNote && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-destructive">Catatan Admin</p>
            <p className="mt-1 text-sm text-foreground">{pendamping.adminNote}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Data Diri</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <DetailRow label="Nama" value={toTitleCase(pendamping.name)} />
            <DetailRow label="Jenis Kelamin" value={pendamping.jenisKelamin === 'L' ? 'Laki-laki' : pendamping.jenisKelamin === 'P' ? 'Perempuan' : '-'} />
            <DetailRow label="Nomor HP" value={pendamping.phone} />
            <DetailRow label="Email" value={pendamping.emailP3h ?? '-'} />
            <DetailRow label="NIK" value={pendamping.nikP3h ?? '-'} />
            <DetailRow label="Kecamatan" value={pendamping.kecamatan ? formatEntityName(pendamping.kecamatan) : '-'} />
            <DetailRow label="Kabupaten/Kota" value={pendamping.kabupaten ? formatEntityName(pendamping.kabupaten) : '-'} />
          </div>
          <DetailRow label="Alamat" value={pendamping.alamatDetail ? formatEntityName(pendamping.alamatDetail) : '-'} />
          <DocumentLink label="KTP" url={pendamping.ktpUrl} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Legalitas P3H</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <DetailRow label="Terdaftar Sejak" value={formatDate(pendamping.createdAt)} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <DocumentLink label="Bukti Registrasi SIHALAL" url={pendamping.registrasiSihalalUrl} />
            <DocumentLink label="Registrasi Resmi BPJPH" url={pendamping.registrasiBpjphUrl} />
            <DocumentLink label="Sertifikat Pelatihan P3H" url={pendamping.sertifikatPelatihanUrl} />
          </div>
        </CardContent>
      </Card>

      <PendampingFormDialog open={formOpen} onOpenChange={setFormOpen} pendamping={pendamping} onSuccess={invalidate} apiBasePath="/api/admin/pendamping" />

      <DeletePendampingDialog
        pendamping={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        onDeleted={() => router.push('/admin/pendamping')}
        apiBasePath="/api/admin/pendamping"
      />

      <VerifyPendampingDialog pendamping={verifying} onOpenChange={(open) => !open && setVerifying(null)} onSuccess={invalidate} />
    </div>
  );
}
