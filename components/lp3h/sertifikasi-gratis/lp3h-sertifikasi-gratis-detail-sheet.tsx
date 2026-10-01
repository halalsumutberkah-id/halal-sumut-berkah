// components/lp3h/sertifikasi-gratis/lp3h-sertifikasi-gratis-detail-sheet.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { Phone, ShieldCheck, Ticket } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';

interface SubmissionDetail {
  id: string;
  status: string;
  createdAt: string;
  halalCertNumber: string | null;
  umkm: { businessName: string; ownerName: string; businessContactNumber: string | null };
  products: { product: { id: string; name: string; photoUrl: string | null } }[];
  pendamping: { name: string; phone: string } | null;
  fasilitasiCode: { code: string } | null;
}

interface Lp3hSertifikasiGratisDetailSheetProps {
  submissionId: string | null;
  onOpenChange: (open: boolean) => void;
}

const STATUS_LABELS: Record<string, string> = {
  ditugaskan: 'Ditugaskan',
  selesai: 'Selesai',
};

function formatText(text: string) {
  const titleCased = toTitleCase(text);
  return titleCased
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bp3h\b/gi, 'P3H')
    .replace(/\bumkm\b/gi, 'UMKM')
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

async function fetchSubmissions(): Promise<SubmissionDetail[]> {
  const res = await fetch('/api/lp3h/sertifikasi-gratis');
  const data = await res.json();
  return data.data || [];
}

export function Lp3hSertifikasiGratisDetailSheet({ submissionId, onOpenChange }: Lp3hSertifikasiGratisDetailSheetProps) {
  // pakai queryKey yang SAMA dengan halaman list ['lp3h', 'sertifikasi-gratis']
  // - kalau list-nya sudah ke-fetch & masih fresh, sheet ini cuma "select"
  // dari cache yang sama, tidak fetch ulang seluruh list tiap kali submissionId
  // beda (dulu: queryKey ikut submissionId, jadi tiap buka detail baru =
  // cache entry baru = fetch ulang SEMUA data dari awal)
  const { data: submission, isLoading } = useQuery({
    queryKey: ['lp3h', 'sertifikasi-gratis'],
    queryFn: fetchSubmissions,
    enabled: !!submissionId,
    select: (submissions) => submissions.find((s) => s.id === submissionId),
  });

  return (
    <Sheet open={!!submissionId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{submission ? formatText(submission.umkm.businessName) : 'Detail Pengajuan'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
          )}

          {submission && (
            <>
              <p className="-mt-2 text-sm text-muted-foreground">Pelaku Usaha: {toTitleCase(submission.umkm.ownerName)}</p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge>{STATUS_LABELS[submission.status] ?? submission.status}</Badge>
                <span className="text-xs text-muted-foreground">Ditugaskan {formatDate(submission.createdAt)}</span>
              </div>

              {submission.fasilitasiCode && (
                <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <Ticket className="size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Kode Fasilitasi</p>
                    <p className="font-mono text-sm font-semibold text-primary">{submission.fasilitasiCode.code}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">Input kode ini saat memproses pengajuan di portal SIHALAL.</p>
                  </div>
                </div>
              )}

              {submission.umkm.businessContactNumber && (
                <a href={`https://wa.me/62${submission.umkm.businessContactNumber.replace(/^0/, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-border p-4 hover:bg-muted/50">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Hubungi UMKM</p>
                    <p className="text-sm text-muted-foreground">{submission.umkm.businessContactNumber}</p>
                  </div>
                </a>
              )}

              {submission.pendamping && (
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted-foreground">Pendamping Ditugaskan</p>
                  <p className="text-sm font-medium text-foreground">
                    {toTitleCase(submission.pendamping.name)} &middot; {submission.pendamping.phone}
                  </p>
                </div>
              )}

              {submission.status === 'selesai' && submission.halalCertNumber && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">Sertifikat Halal</p>
                    <p className="mt-1 text-sm text-green-900/80 dark:text-green-100/80">{submission.halalCertNumber}</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">Produk ({submission.products.length})</h3>
                <div className="flex flex-col gap-2">
                  {submission.products.map(({ product }) => (
                    <div key={product.id} className="flex items-center gap-3 rounded-lg border border-border p-2.5">
                      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                        {product.photoUrl && <Image src={product.photoUrl} alt={formatText(product.name)} width={40} height={40} className="size-full object-cover" />}
                      </div>
                      <span className="text-sm font-medium text-foreground">{formatText(product.name)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
