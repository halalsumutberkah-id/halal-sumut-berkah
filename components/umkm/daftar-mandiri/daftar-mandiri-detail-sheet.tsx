// components/umkm/daftar-mandiri/daftar-mandiri-detail-sheet.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';

interface SubmissionDetail {
  id: string;
  isLowRisk: boolean;
  usesHalalIngredients: boolean;
  simpleCleanProduction: boolean;
  simpleEquipment: boolean;
  simplePreservation: boolean;
  agreedToTerms: boolean;
  status: string;
  adminNote: string | null;
  createdAt: string;
  product: { name: string; photoUrl: string | null };
  lp3h: { name: string; phone: string };
  pendamping: { name: string; phone: string } | null;
}

interface DaftarMandiriDetailSheetProps {
  submissionId: string | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<string, string> = {
  belum_diproses: 'Belum Diproses',
  sedang_diproses: 'Sedang Diproses',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

const STATUS_VARIANTS: Record<string, 'secondary' | 'default' | 'outline' | 'destructive'> = {
  belum_diproses: 'secondary',
  sedang_diproses: 'default',
  selesai: 'outline',
  ditolak: 'destructive',
};

const QUESTIONS: { key: keyof SubmissionDetail; label: string }[] = [
  { key: 'isLowRisk', label: 'Produk berupa barang dan tidak berisiko' },
  { key: 'usesHalalIngredients', label: 'Tidak menggunakan bahan berbahaya, bahan sudah dipastikan halal' },
  { key: 'simpleCleanProduction', label: 'Proses produksi sederhana, bebas kontaminasi najis' },
  { key: 'simpleEquipment', label: 'Peralatan sederhana/manual/semi otomatis (usaha rumahan)' },
  { key: 'simplePreservation', label: 'Proses pengawetan sederhana, tidak kombinasi metode' },
];

async function fetchDetail(id: string): Promise<SubmissionDetail> {
  const res = await fetch(`/api/umkm/daftar-mandiri/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Data tidak ditemukan');
  return data.data;
}

export function DaftarMandiriDetailSheet({ submissionId, onOpenChange }: DaftarMandiriDetailSheetProps) {
  const { data: submission, isLoading } = useQuery({
    queryKey: ['umkm', 'daftar-mandiri', submissionId],
    queryFn: () => fetchDetail(submissionId as string),
    enabled: !!submissionId,
  });

  return (
    <Sheet open={!!submissionId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{submission ? toTitleCase(submission.product.name) : 'Detail Pengajuan'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {submission && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANTS[submission.status] ?? 'secondary'}>{STATUS_LABELS[submission.status] ?? submission.status}</Badge>
                <span className="text-xs text-muted-foreground">Diajukan {formatDate(submission.createdAt)}</span>
              </div>

              {/* catatan Admin - paling penting ditampilkan mencolok kalau
                  statusnya ditolak, biar UMKM langsung tahu kenapa dan
                  apa yang perlu diperbaiki */}
              {submission.adminNote && (
                <div className={`flex items-start gap-3 rounded-xl border p-4 ${submission.status === 'ditolak' ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/40'}`}>
                  <AlertCircle className={`mt-0.5 size-4 shrink-0 ${submission.status === 'ditolak' ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Catatan dari Admin</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{submission.adminNote}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold text-foreground">Pendampingan</h3>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-muted-foreground">LP3H</span>
                    <p>
                      {toTitleCase(submission.lp3h.name)} &middot; {submission.lp3h.phone}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Pendamping</span>
                    <p>{submission.pendamping ? `${toTitleCase(submission.pendamping.name)} \u00b7 ${submission.pendamping.phone}` : '-'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">Jawaban Eligibilitas</h3>
                <div className="flex flex-col gap-2">
                  {QUESTIONS.map((q) => {
                    const value = submission[q.key] as boolean;
                    return (
                      <div key={String(q.key)} className="flex items-start gap-2 text-sm">
                        {value ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" />}
                        <span className="text-muted-foreground">{q.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
