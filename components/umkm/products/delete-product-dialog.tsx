'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { ProductRecord } from '@/components/umkm/products/product-form-dialog';
import { toTitleCase } from '@/lib/title-case';

interface DeleteProductDialogProps {
  product: ProductRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
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

export function DeleteProductDialog({ product, onOpenChange, onDeleted }: DeleteProductDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!product || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/umkm/products/${product.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus produk');
        return;
      }

      toast.success('Produk berhasil dihapus');
      onDeleted();
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={!!product} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus produk ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Produk <strong>{formatText(product?.name ?? '')}</strong> akan dihapus permanen, termasuk dari katalog publik kalau sudah dipublikasikan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive text-white hover:bg-destructive/90">
            {isLoading ? 'Menghapus...' : 'Hapus'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
