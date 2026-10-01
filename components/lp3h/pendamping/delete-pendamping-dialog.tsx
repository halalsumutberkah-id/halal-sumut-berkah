'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { PendampingRecord } from '@/components/lp3h/pendamping/pendamping-form-dialog';
import { toTitleCase } from '@/lib/title-case';

interface DeletePendampingDialogProps {
  pendamping: PendampingRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
  apiBasePath?: string;
}

export function DeletePendampingDialog({ pendamping, onOpenChange, onDeleted, apiBasePath = '/api/lp3h/pendamping' }: DeletePendampingDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!pendamping || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`${apiBasePath}/${pendamping.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus Pendamping (P3H)');
        return;
      }

      toast.success('Pendamping (P3H) berhasil dihapus');
      onDeleted();
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={!!pendamping} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pendamping (P3H) ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Data <strong>{toTitleCase(pendamping?.name)}</strong> akan dihapus permanen. Pendamping (P3H) yang masih memiliki riwayat pengajuan Daftar Mandiri tidak bisa dihapus.
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
