'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { StatisticRecord } from '@/components/admin/statistics/statistic-form-dialog';

interface DeleteStatisticDialogProps {
  statistic: StatisticRecord | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function DeleteStatisticDialog({ statistic, onOpenChange, onDeleted }: DeleteStatisticDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleDelete() {
    if (!statistic || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/statistics/${statistic.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus data');
        return;
      }

      toast.success('Data statistik berhasil dihapus');
      onDeleted();
      onOpenChange(false);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={!!statistic} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus data statistik ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Data periode <strong>{statistic?.period}</strong> untuk <strong>{statistic?.kabupaten}</strong> akan dihapus permanen dan hilang dari grafik publik.
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
