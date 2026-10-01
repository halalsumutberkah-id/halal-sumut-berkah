// components/umkm/products/product-detail-sheet.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/title-case';
import { formatRupiah } from '@/lib/utils';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  halalStatus: string;
  halalCertNumber: string | null;
  verificationStatus: string;
  adminNote: string | null;
  isPublished: boolean;
  category: { name: string };
}

interface ProductDetailSheetProps {
  productId: string | null;
  onOpenChange: (open: boolean) => void;
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

async function fetchDetail(id: string): Promise<ProductDetail> {
  const res = await fetch(`/api/umkm/products/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Data tidak ditemukan');
  return data.data;
}

export function ProductDetailSheet({ productId, onOpenChange }: ProductDetailSheetProps) {
  const { data: product, isLoading } = useQuery({
    queryKey: ['umkm', 'products', productId],
    queryFn: () => fetchDetail(productId as string),
    enabled: !!productId,
    staleTime: 30 * 1000,
  });

  return (
    <Sheet open={!!productId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{product ? formatText(product.name) : 'Detail Produk'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {product && (
            <>
              {product.photoUrl && (
                <div className="relative aspect-square w-full overflow-hidden rounded-xl border bg-muted">
                  <Image src={product.photoUrl} alt={formatText(product.name)} fill className="object-cover" />
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {product.category && <Badge variant="secondary">{formatText(product.category.name)}</Badge>}
                <Badge variant={product.halalStatus === 'halal' ? 'default' : 'secondary'}>{HALAL_STATUS_LABELS[product.halalStatus] ?? product.halalStatus}</Badge>
                <Badge variant={product.verificationStatus === 'terverifikasi' ? 'default' : product.verificationStatus === 'ditolak' ? 'destructive' : 'secondary'}>
                  {VERIFICATION_STATUS_LABELS[product.verificationStatus] ?? product.verificationStatus}
                </Badge>
                <Badge variant={product.isPublished ? 'default' : 'outline'}>{product.isPublished ? 'Sudah Publish' : 'Belum Publish'}</Badge>
              </div>

              <p className="text-lg font-semibold text-primary">{formatRupiah(product.price)}</p>

              {product.adminNote && (
                <div className={`flex items-start gap-3 rounded-xl border p-4 ${product.verificationStatus === 'ditolak' ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/40'}`}>
                  <AlertCircle className={`mt-0.5 size-4 shrink-0 ${product.verificationStatus === 'ditolak' ? 'text-destructive' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Catatan dari Admin</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{product.adminNote}</p>
                  </div>
                </div>
              )}

              {product.halalCertNumber && (
                <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Nomor Sertifikat Halal</p>
                    <p className="mt-1 text-sm text-muted-foreground">{product.halalCertNumber}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
