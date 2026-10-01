// components/umkm/sertifikasi-gratis/sertifikasi-gratis-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { PackageOpen } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EligibleProduct {
  id: string;
  name: string;
  photoUrl: string | null;
}

interface PublicPendamping {
  id: string;
  name: string;
  photoUrl: string | null;
  phone: string;
  kecamatan: string | null;
  kabupaten: string | null;
  activeUmkmCount: number;
  lp3h: { id: string; name: string };
}

interface SertifikasiGratisFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

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

async function fetchEligibleProducts(): Promise<EligibleProduct[]> {
  const res = await fetch('/api/umkm/sertifikasi-gratis/eligible-products');
  const data = await res.json();
  return data.data || [];
}

async function fetchPendampingOptions(): Promise<PublicPendamping[]> {
  const res = await fetch('/api/public/pendamping');
  const data = await res.json();
  return data.data || [];
}

export function SertifikasiGratisFormDialog({ open, onOpenChange, onSuccess }: SertifikasiGratisFormDialogProps) {
  const [products, setProducts] = useState<EligibleProduct[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [pendampingOptions, setPendampingOptions] = useState<PublicPendamping[]>([]);
  const [isFetchingPendampingOptions, setIsFetchingPendampingOptions] = useState(false);
  const [selectedPendampingId, setSelectedPendampingId] = useState<string>('');
  const [pendampingSearch, setPendampingSearch] = useState('');

  useEffect(() => {
    if (!open) return;
    setSelectedIds([]);
    setSelectedPendampingId('');
    setPendampingSearch('');
    setIsFetching(true);
    fetchEligibleProducts()
      .then(setProducts)
      .finally(() => setIsFetching(false));

    setIsFetchingPendampingOptions(true);
    fetchPendampingOptions()
      .then(setPendampingOptions)
      .finally(() => setIsFetchingPendampingOptions(false));
  }, [open]);

  function toggleProduct(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  async function handleSubmit() {
    if (isLoading) return;
    if (selectedIds.length === 0) {
      toast.error('Pilih minimal 1 produk');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/umkm/sertifikasi-gratis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds: selectedIds, pendampingId: selectedPendampingId || null }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success(data.message || 'Pengajuan berhasil dikirim');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  const showAddProductCta = !isFetching && products.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajukan Self Declare</DialogTitle>
          <DialogDescription>Pilih produk yang ingin diajukan. Boleh lebih dari 1 produk sekaligus, semuanya akan diproses dalam 1 pengajuan yang sama.</DialogDescription>
        </DialogHeader>

        {!isFetching && products.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pendamping-select">
              Pendamping <span className="font-normal text-muted-foreground">(opsional)</span>
            </Label>
            {isFetchingPendampingOptions ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <Select
                value={selectedPendampingId || 'none'}
                onValueChange={(v) => setSelectedPendampingId(v === 'none' ? '' : (v ?? ''))}
                disabled={pendampingOptions.length === 0}
                onOpenChange={(o) => {
                  if (!o) setPendampingSearch('');
                }}
              >
                <SelectTrigger id="pendamping-select" className="w-full">
                  <SelectValue placeholder={pendampingOptions.length === 0 ? 'Tidak ada Pendamping tersedia' : 'Pilih Pendamping'}>
                    {selectedPendampingId ? formatText(pendampingOptions.find((p) => p.id === selectedPendampingId)?.name ?? '') : 'Tidak memilih (ditentukan Admin)'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-1.5">
                    <Input placeholder="Cari nama, kabupaten, atau kecamatan..." value={pendampingSearch} onChange={(e) => setPendampingSearch(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="h-8" />
                  </div>
                  <SelectItem value="none">Tidak memilih (ditentukan Admin)</SelectItem>
                  {(() => {
                    const q = pendampingSearch.toLowerCase();
                    const filtered = pendampingOptions.filter((p) => p.name.toLowerCase().includes(q) || (p.kabupaten ?? '').toLowerCase().includes(q) || (p.kecamatan ?? '').toLowerCase().includes(q));
                    if (filtered.length === 0) {
                      return <p className="px-2 py-3 text-center text-sm text-muted-foreground">Tidak ada Pendamping yang cocok</p>;
                    }
                    return filtered.map((pendamping) => (
                      <SelectItem key={pendamping.id} value={pendamping.id}>
                        <div className="flex flex-col gap-0.5 py-0.5">
                          <span>
                            {formatText(pendamping.name)} — {formatText(pendamping.lp3h.name)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {[pendamping.kecamatan, pendamping.kabupaten]
                              .filter((v): v is string => Boolean(v))
                              .map((v) => formatText(v))
                              .join(', ') || 'Lokasi belum diisi'}
                            {' · '}
                            {pendamping.activeUmkmCount} UMKM aktif
                          </span>
                        </div>
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            )}
            <p className="text-xs text-muted-foreground">Pengajuan tetap diverifikasi Admin terlebih dahulu sebelum diteruskan ke LP3H.</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {isFetching ? (
            <div className="flex flex-col gap-2 py-1">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <Skeleton className="size-4 shrink-0 rounded-xs" />
                  <Skeleton className="size-10 shrink-0 rounded-md" />
                  <div className="flex flex-1 flex-col gap-1.5">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <PackageOpen className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tidak ada produk yang bisa diajukan. Pastikan produk anda belum bersertifikat halal dan tidak sedang dalam pengajuan lain.</p>
            </div>
          ) : (
            <div className="flex max-h-80 flex-col gap-1 overflow-y-auto">
              {products.map((product) => (
                <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
                  <Checkbox checked={selectedIds.includes(product.id)} onCheckedChange={() => toggleProduct(product.id)} />
                  <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                    {product.photoUrl && <Image src={product.photoUrl} alt={formatText(product.name)} width={40} height={40} className="size-full object-cover" />}
                  </div>
                  <span className="text-sm font-medium text-foreground">{formatText(product.name)}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          {showAddProductCta && <Button type="button" variant="outline" render={<Link href="/umkm/products">Tambah Produk di E-Catalog</Link>} nativeButton={false} className="mr-auto" />}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" disabled={isLoading || isFetching || selectedIds.length === 0} onClick={handleSubmit}>
            {isLoading ? 'Mengirim...' : `Ajukan ${selectedIds.length > 0 ? `(${selectedIds.length} produk)` : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
