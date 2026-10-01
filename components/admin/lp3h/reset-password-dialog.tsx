// components/admin/lp3h/reset-password-dialog.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Lp3hRecord } from '@/components/admin/lp3h/lp3h-form-dialog';
import { toTitleCase } from '@/lib/title-case';

interface ResetPasswordDialogProps {
  lp3h: Lp3hRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: (credentials: { email: string; password: string }) => void;
}

export function ResetPasswordDialog({ lp3h, onOpenChange, onSuccess }: ResetPasswordDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset() {
    if (!lp3h || isLoading) return;
    setIsLoading(true);

    try {
      const res = await fetch(`/api/admin/lp3h/${lp3h.id}/reset-password`, {
        method: 'PATCH',
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal mereset password');
        return;
      }

      onOpenChange(false);
      onSuccess(data.credentials);
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
          <AlertDialogTitle>Reset password LP3H ini?</AlertDialogTitle>
          <AlertDialogDescription>
            Password lama <strong>{toTitleCase(lp3h?.name)}</strong> akan diganti dengan password baru yang digenerate otomatis. Password lama tidak akan bisa dipakai lagi setelah ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Reset Password'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
