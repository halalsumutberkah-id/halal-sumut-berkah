// components/admin/sertifikasi-gratis/edit-assignment-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { UserRoundCog, XCircle } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface PublicPendamping {
  id: string;
  name: string;
  lp3h: { id: string; name: string };
}

export interface EditAssignmentRecord {
  id: string;
  umkm: { businessName: string };
  pendamping: { name: string } | null;
}

interface EditAssignmentDialogProps {
  submission: EditAssignmentRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

async function fetchPendampingOptions(): Promise<PublicPendamping[]> {
  const res = await fetch('/api/public/pendamping');
  const data = await res.json();
  return data.data || [];
}

// D4b - Admin ganti (reassign) atau batalkan (cancel) penugasan Pendamping
// yang SUDAH "ditugaskan". Terpisah dari VerifySertifikasiGratisDialog
// karena beda konteks: itu buat transisi awal (menunggu_verifikasi ->
// ditugaskan/ditolak), ini buat ubah penugasan yang SUDAH berjalan.
export function EditAssignmentDialog({ submission, onOpenChange, onSuccess }: EditAssignmentDialogProps) {
  const [pendampingId, setPendampingId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const { data: pendampingOptions = [] } = useQuery({
    queryKey: ['public', 'pendamping'],
    queryFn: fetchPendampingOptions,
    enabled: !!submission,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (submission) {
      setPendampingId('');
      setCancelConfirmOpen(false);
    }
  }, [submission]);

  async function handleReassign() {
    if (!submission || isLoading) return;
    if (!pendampingId) {
      toast.error('Pilih Pendamping pengganti terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sertifikasi-gratis/${submission.id}/assignment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reassign', pendampingId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }
      toast.success('Pendamping berhasil diganti');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCancel() {
    if (!submission || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sertifikasi-gratis/${submission.id}/assignment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }
      toast.success('Penugasan berhasil dibatalkan, pengajuan kembali ke status Menunggu Verifikasi');
      setCancelConfirmOpen(false);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Dialog open={!!submission} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Penugasan</DialogTitle>
            <DialogDescription>
              {submission && (
                <>
                  Pengajuan <strong>{toTitleCase(submission.umkm.businessName)}</strong> saat ini ditugaskan ke <strong>{submission.pendamping ? toTitleCase(submission.pendamping.name) : '-'}</strong>.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                <UserRoundCog className="size-4 text-primary" />
                Ganti Pendamping
              </h4>
              <div className="flex flex-col gap-3">
                <Select value={pendampingId} onValueChange={(v) => setPendampingId(v ?? '')} disabled={isLoading}>
                  <SelectTrigger className="w-full">
                    {pendampingId ? (
                      <SelectValue>
                        {(() => {
                          const p = pendampingOptions.find((opt) => opt.id === pendampingId);
                          return p ? `${toTitleCase(p.name)} — ${toTitleCase(p.lp3h.name)}` : '';
                        })()}
                      </SelectValue>
                    ) : (
                      <SelectValue placeholder="Pilih Pendamping pengganti" />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {pendampingOptions.length === 0 ? (
                      <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
                    ) : (
                      pendampingOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {toTitleCase(p.name)} — {toTitleCase(p.lp3h.name)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button type="button" disabled={isLoading || !pendampingId} onClick={handleReassign} className="w-fit">
                  {isLoading ? 'Memproses...' : 'Ganti Pendamping'}
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
                <XCircle className="size-4" />
                Batalkan Penugasan
              </h4>
              <p className="mb-3 text-xs text-muted-foreground">Pengajuan akan dikembalikan ke status "Menunggu Verifikasi" dan bisa diproses ulang dari awal.</p>
              <Button type="button" variant="outline" disabled={isLoading} onClick={() => setCancelConfirmOpen(true)} className="w-fit border-destructive text-destructive hover:bg-destructive/10">
                Batalkan Penugasan
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Batalkan penugasan ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Pengajuan <strong>{submission ? toTitleCase(submission.umkm.businessName) : ''}</strong> akan kembali ke status "Menunggu Verifikasi". Pendamping yang sedang ditugaskan akan dikabari bahwa tugasnya dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isLoading} className="bg-destructive text-white hover:bg-destructive/90">
              {isLoading ? 'Memproses...' : 'Ya, Batalkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
