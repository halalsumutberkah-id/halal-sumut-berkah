// components/admin/pendamping/verify-pendamping-dialog.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface VerifyPendampingRecord {
  id: string;
  name: string;
  verificationStatus: string;
}

interface VerifyPendampingDialogProps {
  pendamping: VerifyPendampingRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VerifyPendampingDialog({ pendamping, onOpenChange, onSuccess }: VerifyPendampingDialogProps) {
  const [adminNote, setAdminNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleVerify(status: 'terverifikasi' | 'ditolak') {
    if (!pendamping || isLoading) return;

    if (status === 'ditolak' && !adminNote.trim()) {
      toast.error('Catatan wajib diisi kalau menolak');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/pendamping/${pendamping.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationStatus: status, adminNote }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success(status === 'terverifikasi' ? 'Pendamping (P3H) berhasil diverifikasi' : 'Pendamping (P3H) ditolak');
      setAdminNote('');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={!!pendamping} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verifikasi Pendamping (P3H)</DialogTitle>
          <DialogDescription>
            {pendamping && (
              <>
                Periksa kelengkapan data legalitas <strong>{toTitleCase(pendamping.name)}</strong> sebelum menyetujui.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label>Catatan (wajib kalau menolak)</Label>
          <Textarea rows={3} placeholder="Contoh: Screenshot registrasi SIHALAL tidak terbaca, mohon unggah ulang" disabled={isLoading} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" disabled={isLoading} onClick={() => handleVerify('ditolak')} className="border-destructive text-destructive hover:bg-destructive/10">
            Tolak
          </Button>
          <Button type="button" disabled={isLoading} onClick={() => handleVerify('terverifikasi')}>
            {isLoading ? 'Memproses...' : 'Setujui'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
