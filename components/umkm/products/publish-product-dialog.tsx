// components/umkm/products/publish-product-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { publishProductSchema } from '@/schemas/publish-product.schema';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toTitleCase } from '@/lib/title-case';

interface Lp3hOption {
  id: string;
  name: string;
}

interface PublishProductDialogProps {
  productId: string | null;
  productName: string;
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

const emptyValues = {
  lp3hId: '',
  agreedResponsibility: false,
  agreedPublicationConsent: false,
};

export function PublishProductDialog({ productId, productName, onOpenChange, onSuccess }: PublishProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLp3h, setIsFetchingLp3h] = useState(false);
  const [lp3hOptions, setLp3hOptions] = useState<Lp3hOption[]>([]);

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading || !productId) return;

      const parsed = publishProductSchema.safeParse(value);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/umkm/products/${productId}/publish`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success('Produk berhasil dipublikasikan ke katalog');
        onOpenChange(false);
        onSuccess();
      } catch {
        toast.error('Terjadi kesalahan pada server');
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (productId) {
      form.reset(emptyValues);
      setIsFetchingLp3h(true);
      fetch(`/api/umkm/products/${productId}/lp3h-history`)
        .then((res) => res.json())
        .then((res) => setLp3hOptions(res.data || []))
        .catch(() => toast.error('Gagal memuat daftar LP3H'))
        .finally(() => setIsFetchingLp3h(false));
    }
  }, [productId]);

  return (
    <Dialog open={!!productId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Publish ke E-Catalog</DialogTitle>
          <DialogDescription>
            Publikasikan <strong>{formatText(productName)}</strong> ke katalog produk halal publik.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="lp3hId">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Pilih LP3H yang Digunakan (opsional)</Label>

                {isFetchingLp3h ? (
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-10 w-full rounded-md" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                ) : (
                  <>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading}>
                      <SelectTrigger className="w-full">
                        {field.state.value ? (
                          <SelectValue>{formatText(lp3hOptions.find((l) => l.id === field.state.value)?.name ?? '')}</SelectValue>
                        ) : (
                          <SelectValue placeholder={lp3hOptions.length === 0 ? 'Belum ada riwayat LP3H' : 'Pilih LP3H'} />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        {lp3hOptions.length === 0 ? (
                          <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
                        ) : (
                          lp3hOptions.map((l) => (
                            <SelectItem key={l.id} value={l.id}>
                              {formatText(l.name)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {lp3hOptions.length === 0 && <span className="text-xs text-muted-foreground">Produk ini belum pernah diajukan lewat Sertifikasi Halal Gratis.</span>}
                  </>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="agreedResponsibility">
            {(field) => (
              <label className="flex items-start gap-2 text-sm font-normal">
                <Checkbox checked={field.state.value} disabled={isLoading} onCheckedChange={(checked) => field.handleChange(checked === true)} />
                <span>Saya bersedia bertanggung jawab atas kebenaran data produk ini.</span>
              </label>
            )}
          </form.Field>

          <form.Field name="agreedPublicationConsent">
            {(field) => (
              <label className="flex items-start gap-2 text-sm font-normal">
                <Checkbox checked={field.state.value} disabled={isLoading} onCheckedChange={(checked) => field.handleChange(checked === true)} />
                <span>Saya memberikan izin kepada Dinas Koperasi UKM Sumut dan mitra terkait untuk menampilkan informasi produk ini pada Katalog Produk Halal.</span>
              </label>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading || isFetchingLp3h}>
                  {isLoading ? 'Mempublikasikan...' : 'Publish'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
