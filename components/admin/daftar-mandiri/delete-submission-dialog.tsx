// components/admin/daftar-mandiri/delete-submission-dialog.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export interface SubmissionRecord {
  id: string;
  product: { name: string; umkm: { businessName: string } };
}

interface DeleteSubmissionDialogProps {
  submission: SubmissionRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteSubmissionDialog({ submission, onOpenChange, onDeleted }: DeleteSubmissionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!submission || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/daftar-mandiri/${submission.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus pengajuan');
        return;
      }

      toast.success('Pengajuan berhasil dihapus');
      onDeleted();
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={!!submission} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus pengajuan ini?</AlertDialogTitle>
          <AlertDialogDescription>
            {submission && (
              <>
                Pengajuan Daftar Mandiri dari <strong>{submission.product.umkm.businessName}</strong> untuk produk <strong>{submission.product.name}</strong> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.
              </>
            )}
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
