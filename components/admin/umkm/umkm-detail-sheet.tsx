// components/admin/umkm/umkm-detail-sheet.tsx

'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { FileText, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  cv: 'CV',
  pt: 'PT',
  koperasi: 'Koperasi',
  perorangan: 'Perorangan',
  lainnya: 'Lainnya',
};

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

interface UmkmDetail {
  id: string;
  ownerName: string;
  ownerNik: string | null;
  birthDate: string | null;
  ownerPhone: string;
  ownerKecamatan: string;
  ownerKabupaten: string;
  ownerAddress: string;
  ktpUrl: string | null;

  businessName: string;
  logoUrl: string | null;
  nibNumber: string;
  nibUrl: string | null;
  establishedYear: number;
  businessKecamatan: string;
  businessKabupaten: string;
  businessAddress: string;
  businessType: string;
  annualRevenue: string;
  businessContactNumber: string | null;

  createdAt: string;
  user: { email: string };
  businessCategory: { name: string };
  products: {
    id: string;
    name: string;
    halalStatus: string;
    verificationStatus: string;
    isPublished: boolean;
  }[];
}

interface UmkmDetailSheetProps {
  umkmId: string | null;
  onOpenChange: (open: boolean) => void;
}

async function fetchDetail(id: string): Promise<UmkmDetail> {
  const res = await fetch(`/api/admin/umkm/${id}`);
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

export function UmkmDetailSheet({ umkmId, onOpenChange }: UmkmDetailSheetProps) {
  const { data: umkm, isLoading } = useQuery({
    queryKey: ['admin', 'umkm', umkmId],
    queryFn: () => fetchDetail(umkmId as string),
    enabled: !!umkmId,
    staleTime: 30 * 1000,
  });

  return (
    <Sheet open={!!umkmId} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{umkm ? toTitleCase(umkm.businessName) : 'Detail UMKM'}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-6 px-4 pb-6">
          {isLoading && (
            <div className="flex flex-col gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          )}

          {umkm && (
            <>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{toTitleCase(umkm.businessCategory.name)}</Badge>
                <Badge variant="outline">{umkm.products.length} Produk</Badge>
              </div>

              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <h3 className="text-sm font-semibold text-foreground">A. Data Pelaku Usaha</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailRow label="Nama Pelaku Usaha" value={toTitleCase(umkm.ownerName)} />
                  <DetailRow label="NIK" value={umkm.ownerNik ?? '-'} />
                  <DetailRow label="Tanggal Lahir" value={umkm.birthDate ? formatDate(umkm.birthDate) : '-'} />
                  <DetailRow label="Nomor WhatsApp" value={umkm.ownerPhone} />
                  <DetailRow label="Email" value={umkm.user.email} />
                  <DetailRow label="Kecamatan" value={toTitleCase(umkm.ownerKecamatan)} />
                  <DetailRow label="Kabupaten/Kota" value={umkm.ownerKabupaten} />
                </div>
                <DetailRow label="Alamat" value={toTitleCase(umkm.ownerAddress)} />
                <DocumentLink label="KTP" url={umkm.ktpUrl} />
              </div>

              <div className="flex flex-col gap-4 rounded-lg border p-4">
                <h3 className="text-sm font-semibold text-foreground">B. Data Usaha</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailRow label="Nomor NIB" value={umkm.nibNumber} />
                  <DetailRow label="Bentuk Usaha" value={BUSINESS_TYPE_LABELS[umkm.businessType] ?? umkm.businessType} />
                  <DetailRow label="Tahun Berdiri" value={String(umkm.establishedYear)} />
                  <DetailRow label="Kecamatan" value={toTitleCase(umkm.businessKecamatan)} />
                  <DetailRow label="Kabupaten/Kota" value={umkm.businessKabupaten} />
                  <DetailRow label="Nilai Omset/Tahun" value={umkm.annualRevenue} />
                  <DetailRow label="Kontak Usaha (Publik)" value={umkm.businessContactNumber ?? '-'} />
                  <DetailRow label="Terdaftar Sejak" value={formatDate(umkm.createdAt)} />
                </div>
                <DetailRow label="Alamat" value={toTitleCase(umkm.businessAddress)} />
                <DocumentLink label="NIB" url={umkm.nibUrl} />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-foreground">Daftar Produk ({umkm.products.length})</h3>
                {umkm.products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Belum ada produk.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {umkm.products.map((product) => (
                      <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-center justify-between rounded-md border p-3 text-sm transition-colors hover:bg-muted">
                        <span className="font-medium text-foreground">{toTitleCase(product.name)}</span>
                        <div className="flex items-center gap-1.5">
                          {product.halalStatus === 'halal' ? (
                            product.verificationStatus === 'terverifikasi' ? (
                              <Badge className="bg-emerald-600 text-[10px] text-white hover:bg-emerald-700 dark:bg-emerald-500">
                                <ShieldCheck className="mr-0.5 size-3" />
                                Halal
                              </Badge>
                            ) : product.verificationStatus === 'ditolak' ? (
                              <Badge variant="destructive" className="text-[10px]">
                                Halal (Ditolak)
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                                <Clock className="mr-0.5 size-2.5" />
                                Halal (Verifikasi)
                              </Badge>
                            )
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              {HALAL_STATUS_LABELS[product.halalStatus] ?? product.halalStatus}
                            </Badge>
                          )}

                          <Badge variant={product.verificationStatus === 'terverifikasi' ? 'default' : product.verificationStatus === 'ditolak' ? 'destructive' : 'secondary'} className="text-[10px]">
                            {VERIFICATION_STATUS_LABELS[product.verificationStatus] ?? product.verificationStatus}
                          </Badge>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
