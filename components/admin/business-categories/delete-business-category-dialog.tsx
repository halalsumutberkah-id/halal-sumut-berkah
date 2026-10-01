// components/admin/business-categories/delete-business-category-dialog.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { BusinessCategoryRecord } from '@/components/admin/business-categories/business-category-form-dialog';
import { toTitleCase } from '@/lib/title-case';

interface DeleteBusinessCategoryDialogProps {
  category: BusinessCategoryRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteBusinessCategoryDialog({ category, onOpenChange, onDeleted }: DeleteBusinessCategoryDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!category || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/business-categories/${category.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus kategori usaha');
        return;
      }

      toast.success('Kategori usaha berhasil dihapus');
      onDeleted();
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={!!category} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus kategori usaha ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Kategori <strong>{toTitleCase(category?.name)}</strong> akan dihapus permanen. Kategori yang masih dipakai UMKM tidak bisa dihapus.
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
