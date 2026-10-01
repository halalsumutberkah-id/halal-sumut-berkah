// app/admin/products/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toTitleCase } from '@/lib/title-case';
import { formatDate, formatRupiah } from '@/lib/utils';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  shortDescription: string | null;
  photoUrl: string | null;
  halalStatus: string;
  halalCertNumber: string | null;
  halalCertUrl: string | null;
  pirtNumber: string | null;
  bpomNumber: string | null;
  hakiNumber: string | null;
  verificationStatus: string;
  adminNote: string | null;
  isPublished: boolean;
  createdAt: string;
  umkm: { businessName: string; ownerName: string; user: { email: string } };
  category: { name: string };
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Menunggu Verifikasi' },
  { value: 'terverifikasi', label: 'Terverifikasi' },
  { value: 'ditolak', label: 'Ditolak' },
];

const HALAL_STATUS_LABELS: Record<string, string> = {
  belum_halal: 'Belum Halal',
  proses: 'Proses Sertifikasi',
  halal: 'Halal',
};

function formatText(text: string) {
  const titleCased = toTitleCase(text);
  return titleCased
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
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
  const res = await fetch(`/api/admin/products/${id}`);
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

export default function AdminProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ['admin', 'products', params.id],
    queryFn: () => fetchDetail(params.id),
    staleTime: 30 * 1000,
  });

  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [adminNote, setAdminNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setVerificationStatus(product.verificationStatus);
      setAdminNote(product.adminNote ?? '');
    }
  }, [product]);

  async function handleSave() {
    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/admin/products/${params.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus, adminNote }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success('Status verifikasi berhasil diperbarui, email notifikasi telah dikirim ke UMKM');
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products', params.id] });
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="flex flex-col gap-6">
      <Button variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={() => router.push('/admin/products')}>
        <ArrowLeft className="size-4" />
        Kembali ke daftar produk
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{formatText(product.name)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Diajukan oleh {formatText(product.umkm.businessName)} ({toTitleCase(product.umkm.ownerName)}) &middot; {formatDate(product.createdAt)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant={product.halalStatus === 'halal' ? 'default' : 'secondary'}>{HALAL_STATUS_LABELS[product.halalStatus] ?? product.halalStatus}</Badge>
          <Badge variant={product.isPublished ? 'default' : 'outline'}>{product.isPublished ? 'Sudah Publish' : 'Belum Publish'}</Badge>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Data Produk</h3>
          {product.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.photoUrl} alt={product.name} className="h-40 w-40 rounded-md border object-cover" />
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow label="Kategori" value={formatText(product.category.name)} />
            <DetailRow label="Harga" value={formatRupiah(product.price)} />
            <DetailRow label="Email UMKM" value={product.umkm.user.email} />
          </div>
          {product.shortDescription && <DetailRow label="Deskripsi Singkat" value={formatText(product.shortDescription)} />}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Sertifikat Halal & Izin Tambahan</h3>
          <DocumentLink label="Sertifikat Halal" url={product.halalCertUrl} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <DetailRow label="Nomor PIRT" value={product.pirtNumber ?? '-'} />
            <DetailRow label="Nomor BPOM" value={product.bpomNumber ?? '-'} />
            <DetailRow label="Nomor HAKI" value={product.hakiNumber ?? '-'} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold text-foreground">Verifikasi Admin</h3>
          <p className="text-xs text-muted-foreground">Mengubah status ini akan mengirim notifikasi email ke UMKM secara otomatis.</p>

          <div className="flex flex-col gap-1.5">
            <Label>Status Verifikasi</Label>
            <Select value={verificationStatus} onValueChange={(v) => setVerificationStatus(v ?? 'pending')}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue>{STATUS_OPTIONS.find((o) => o.value === verificationStatus)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Catatan (wajib diisi kalau status Ditolak)</Label>
            <Textarea rows={3} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Jelaskan bagian mana yang perlu diperbaiki UMKM" />
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="w-fit">
            {isSaving ? 'Menyimpan...' : 'Simpan & Kirim Notifikasi'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
