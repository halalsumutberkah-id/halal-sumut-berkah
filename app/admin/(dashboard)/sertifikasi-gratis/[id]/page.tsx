// app/admin/(dashboard)/sertifikasi-gratis/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ShieldCheck, CheckCircle2, FileText, ExternalLink, Ticket, UserRoundCog } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { VerifySertifikasiGratisDialog, type VerifySubmissionRecord } from '@/components/admin/sertifikasi-gratis/verify-sertifikasi-gratis-dialog';
import { CompleteSertifikasiGratisDialog, type CompleteSubmissionRecord } from '@/components/admin/sertifikasi-gratis/complete-sertifikasi-gratis-dialog';
import { EditAssignmentDialog, type EditAssignmentRecord } from '@/components/admin/sertifikasi-gratis/edit-assignment-dialog';

interface SubmissionDetail {
  id: string;
  status: string;
  createdAt: string;
  adminNote: string | null;
  halalCertNumber: string | null;
  halalCertUrl: string | null;
  umkm: { businessName: string; ownerName: string };
  products: { product: { id: string; name: string; photoUrl: string | null } }[];
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

async function fetchDetail(id: string): Promise<SubmissionDetail> {
  const res = await fetch(`/api/admin/sertifikasi-gratis/${id}`);
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

export default function AdminSertifikasiGratisDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: submission, isLoading } = useQuery({
    queryKey: ['admin', 'sertifikasi-gratis', params.id],
    queryFn: () => fetchDetail(params.id),
    staleTime: 30 * 1000,
  });

  const [verifying, setVerifying] = useState<VerifySubmissionRecord | null>(null);
  const [completing, setCompleting] = useState<CompleteSubmissionRecord | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<EditAssignmentRecord | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'sertifikasi-gratis', params.id] });
    queryClient.invalidateQueries({ queryKey: ['admin', 'sertifikasi-gratis'] });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!submission) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={() => router.push('/admin/sertifikasi-gratis')}>
          <ArrowLeft className="size-4" />
          Kembali ke daftar Self Declare
        </Button>

        <div className="flex flex-wrap gap-2">
          {submission.status === 'menunggu_verifikasi' && (
            <Button variant="outline" onClick={() => setVerifying(submission)}>
              <ShieldCheck className="size-4" />
              Verifikasi
            </Button>
          )}
          {submission.status === 'ditugaskan' && (
            <>
              <Button variant="outline" onClick={() => setEditingAssignment(submission)}>
                <UserRoundCog className="size-4" />
                Edit Penugasan
              </Button>
              <Button variant="outline" onClick={() => setCompleting(submission)}>
                <CheckCircle2 className="size-4" />
                Tandai Selesai
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-foreground">{toTitleCase(submission.umkm.businessName)}</h1>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={STATUS_VARIANTS[submission.status] ?? 'secondary'}>{STATUS_LABELS[submission.status] ?? submission.status}</Badge>
          <Badge variant="outline">{submission.products.length} Produk</Badge>
          {submission.fasilitasiCode && (
            <Badge variant="outline" className="gap-1 font-mono">
              <Ticket className="size-3" />
              {submission.fasilitasiCode.code}
            </Badge>
          )}
        </div>
      </div>

      {submission.adminNote && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-xs font-medium text-destructive">Catatan Admin</p>
            <p className="mt-1 text-sm text-foreground">{submission.adminNote}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Data Pengajuan</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <DetailRow label="UMKM" value={toTitleCase(submission.umkm.businessName)} />
            <DetailRow label="Nama Pelaku Usaha" value={toTitleCase(submission.umkm.ownerName)} />
            <DetailRow label="LP3H" value={submission.lp3h ? toTitleCase(submission.lp3h.name) : '-'} />
            <DetailRow label="Pendamping" value={submission.pendamping ? toTitleCase(submission.pendamping.name) : '-'} />
            <DetailRow label="Kode Fasilitasi" value={submission.fasilitasiCode?.code ?? '-'} />
            <DetailRow label="Diajukan" value={formatDate(submission.createdAt)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Produk Diajukan ({submission.products.length})</h3>
          <div className="flex flex-col gap-2">
            {submission.products.map(({ product }) => (
              <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted">
                <span className="font-medium">{toTitleCase(product.name)}</span>
                <ExternalLink className="size-3.5 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {submission.status === 'selesai' && (
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h3 className="text-sm font-semibold text-foreground">Sertifikat Halal</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <DetailRow label="Nomor Sertifikat Halal" value={submission.halalCertNumber ?? '-'} />
            </div>
            <DocumentLink label="Sertifikat Halal" url={submission.halalCertUrl} />
          </CardContent>
        </Card>
      )}

      <VerifySertifikasiGratisDialog submission={verifying} onOpenChange={(open) => !open && setVerifying(null)} onSuccess={invalidate} />

      <CompleteSertifikasiGratisDialog submission={completing} onOpenChange={(open) => !open && setCompleting(null)} onSuccess={invalidate} />

      <EditAssignmentDialog submission={editingAssignment} onOpenChange={(open) => !open && setEditingAssignment(null)} onSuccess={invalidate} />
    </div>
  );
}
