// components/umkm/sertifikasi-gratis/sertifikasi-gratis-detail-sheet.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { AlertCircle, ShieldCheck, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';

interface PendampingDetail {
  name: string;
  phone: string;
  photoUrl: string | null;
  emailP3h: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
}

interface SubmissionDetail {
  id: string;
  status: string;
  adminNote: string | null;
  halalCertNumber: string | null;
  createdAt: string;
  products: { product: { id: string; name: string; photoUrl: string | null } }[];
  lp3h: { name: string; phone: string } | null;
  pendamping: PendampingDetail | null;
}

interface SertifikasiGratisDetailSheetProps {
  submissionId: string | null;
  onOpenChange: (open: boolean) => void;
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

function formatText(text: string) {
  const titleCased = toTitleCase(text);
  return titleCased
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
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

function toWhatsappHref(phone: string, pendampingName: string, umkmName?: string) {
  const digits = phone.replace(/\D/g, '');
  const message = `Halo ${toTitleCase(pendampingName)}, saya dari ${umkmName ? toTitleCase(umkmName) : 'UMKM'} ingin bertanya mengenai pendampingan Self Declare saya.`;
  return `https://wa.me/62${digits.replace(/^0/, '')}?text=${encodeURIComponent(message)}`;
}

async function fetchDetail(id: string): Promise<SubmissionDetail> {
  const res = await fetch(`/api/umkm/sertifikasi-gratis/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Data tidak ditemukan');
  return data.data;
}

export function SertifikasiGratisDetailSheet({ submissionId, onOpenChange }: SertifikasiGratisDetailSheetProps) {
  const { data: submission, isLoading } = useQuery({
    queryKey: ['umkm', 'sertifikasi-gratis', submissionId],
    queryFn: () => fetchDetail(submissionId as string),
    enabled: !!submissionId,
    // endpoint detail-nya udah 1 query efisien di backend, ini cuma
    // ngurangin refetch kalau user tutup-buka sheet yang sama berkali-kali
    // dalam waktu singkat
    staleTime: 30 * 1000,
  });

  return (
    <Sheet open={!!submissionId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Detail Pengajuan Self Declare</SheetTitle>
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
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={STATUS_VARIANTS[submission.status] ?? 'secondary'}>{STATUS_LABELS[submission.status] ?? submission.status}</Badge>
                <span className="text-xs text-muted-foreground">Diajukan {formatDate(submission.createdAt)}</span>
              </div>

              {submission.status === 'selesai' && submission.halalCertNumber && (
                <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                  <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs font-semibold text-green-800 dark:text-green-300">Sertifikat Halal</p>
                    <p className="mt-1 text-sm text-green-900/80 dark:text-green-100/80">{submission.halalCertNumber}</p>
                  </div>
                </div>
              )}

              {submission.adminNote && (
                <div className={`flex items-start gap-3 rounded-xl border p-4 ${submission.status === 'ditolak' ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/40'}`}>
                  <AlertCircle className={`mt-0.5 size-4 shrink-0 ${submission.status === 'ditolak' ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Catatan dari Admin</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{submission.adminNote}</p>
                  </div>
                </div>
              )}

              {submission.lp3h && (
                <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">LP3H Pendamping</h3>
                  <p className="text-sm">
                    {formatText(submission.lp3h.name)} &middot; {submission.lp3h.phone}
                  </p>
                </div>
              )}

              {submission.pendamping && (
                <div className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold text-foreground">Pendamping (P3H)</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                      {submission.pendamping.photoUrl && <Image src={submission.pendamping.photoUrl} alt={toTitleCase(submission.pendamping.name)} width={48} height={48} className="size-full object-cover" />}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-foreground">{toTitleCase(submission.pendamping.name)}</span>
                      {(submission.pendamping.kecamatan || submission.pendamping.kabupaten) && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3 shrink-0" />
                          {[submission.pendamping.kecamatan, submission.pendamping.kabupaten]
                            .filter((v): v is string => Boolean(v))
                            .map(formatText)
                            .join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Phone className="size-3.5 shrink-0" />
                      {submission.pendamping.phone}
                    </span>
                    {submission.pendamping.emailP3h && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5 shrink-0" />
                        {submission.pendamping.emailP3h}
                      </span>
                    )}
                  </div>

                  <Button
                    render={
                      <a href={toWhatsappHref(submission.pendamping.phone, submission.pendamping.name)} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="size-4" />
                        Hubungi via WhatsApp
                      </a>
                    }
                    nativeButton={false}
                    className="w-full justify-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                  />
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
