// components/admin/fasilitasi-code/delete-fasilitasi-code-dialog.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { FasilitasiCodeRecord } from '@/components/admin/fasilitasi-code/fasilitasi-code-form-dialog';

interface DeleteFasilitasiCodeDialogProps {
  fasilitasiCode: FasilitasiCodeRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteFasilitasiCodeDialog({ fasilitasiCode, onOpenChange, onDeleted }: DeleteFasilitasiCodeDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!fasilitasiCode || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/fasilitasi-code/${fasilitasiCode.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus Kode Fasilitasi');
        return;
      }

      toast.success('Kode Fasilitasi berhasil dihapus');
      onDeleted();
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={!!fasilitasiCode} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Kode Fasilitasi ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Kode <strong>{fasilitasiCode?.code}</strong> akan dihapus permanen. Kode yang sudah pernah dipakai di pengajuan tidak bisa dihapus.
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
