// components/admin/lp3h/delete-lp3h-dialog.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Lp3hRecord } from '@/components/admin/lp3h/lp3h-form-dialog';
import { toTitleCase } from '@/lib/title-case';

interface DeleteLp3hDialogProps {
  lp3h: Lp3hRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteLp3hDialog({ lp3h, onOpenChange, onDeleted }: DeleteLp3hDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!lp3h || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/lp3h/${lp3h.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus LP3H');
        return;
      }

      toast.success('LP3H berhasil dihapus');
      onDeleted();
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={!!lp3h} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus LP3H ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. LP3H <strong>{toTitleCase(lp3h?.name)}</strong> akan dihapus permanen. LP3H yang masih memiliki data Pendamping tidak bisa dihapus.
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
