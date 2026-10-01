// components/admin/sertifikasi-gratis/verify-sertifikasi-gratis-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ShieldCheck, XCircle } from 'lucide-react';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface PublicPendamping {
  id: string;
  name: string;
  kecamatan: string | null;
  kabupaten: string | null;
  activeUmkmCount: number;
  lp3h: { id: string; name: string };
}

export interface VerifySubmissionRecord {
  id: string;
  umkm: { businessName: string };
  products: { product: { name: string } }[];
  // Pendamping yang SUDAH DIPILIH UMKM sendiri pas submit (opsional saat
  // itu). Kalau ada, Admin cukup approve tanpa pilih apapun lagi.
  pendamping: { name: string } | null;
}

interface VerifySertifikasiGratisDialogProps {
  submission: VerifySubmissionRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type ActionMode = 'select' | 'approve' | 'reject';

async function fetchPendampingOptions(): Promise<PublicPendamping[]> {
  const res = await fetch('/api/public/pendamping');
  const data = await res.json();
  return data.data || [];
}

export function VerifySertifikasiGratisDialog({ submission, onOpenChange, onSuccess }: VerifySertifikasiGratisDialogProps) {
  // pisah form Tolak & Terima (D4a) - Admin harus pilih aksinya dulu
  // sebelum form yang relevan muncul, biar gak ke-klik salah antara
  // "Setujui" dan "Tolak" yang tadinya nampil bareng dalam 1 layar
  const [actionMode, setActionMode] = useState<ActionMode>('select');

  const hasExistingPendamping = !!submission?.pendamping;

  // false = pakai pendamping yang sudah dipilih UMKM (kalau ada), tanpa
  // perlu Admin pilih apapun. true = Admin pilih/override manual.
  // Default true kalau UMKM belum pilih apa-apa (Admin WAJIB pilih).
  const [isOverriding, setIsOverriding] = useState(!hasExistingPendamping);
  const [pendampingId, setPendampingId] = useState('');
  const [pendampingSearch, setPendampingSearch] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // list Pendamping (semua LP3H, flat) jarang berubah - staleTime 5 menit
  // (sama window cache backend-nya) biar admin yang buka-tutup dialog ini
  // berkali-kali gak fetch ulang tiap kali. Cuma di-fetch kalau Admin
  // beneran mau override / UMKM belum pilih sama sekali, DAN lagi ada di
  // mode approve.
  const { data: pendampingOptions = [] } = useQuery({
    queryKey: ['public', 'pendamping'],
    queryFn: fetchPendampingOptions,
    enabled: !!submission && actionMode === 'approve' && isOverriding,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (submission) {
      setActionMode('select');
      setIsOverriding(!submission.pendamping);
      setPendampingId('');
      setPendampingSearch('');
      setAdminNote('');
    }
  }, [submission]);

  async function handleApprove() {
    if (!submission || isLoading) return;

    // cuma perlu validasi pilihan kalau Admin lagi mode override (atau
    // UMKM emang belum pilih sama sekali) - kalau enggak, backend otomatis
    // pakai pendamping yang sudah dipilih UMKM
    if (isOverriding && !pendampingId) {
      toast.error('Pendamping wajib dipilih');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sertifikasi-gratis/${submission.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isOverriding ? { status: 'ditugaskan', pendampingId } : { status: 'ditugaskan' }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }
      toast.success('Pengajuan berhasil ditugaskan');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReject() {
    if (!submission || isLoading) return;
    if (!adminNote.trim()) {
      toast.error('Catatan wajib diisi kalau menolak');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/sertifikasi-gratis/${submission.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ditolak', adminNote }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }
      toast.success('Pengajuan berhasil ditolak');
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    setActionMode('select');
    setIsOverriding(!submission?.pendamping);
    setPendampingId('');
    setPendampingSearch('');
    setAdminNote('');
  }

  return (
    <Dialog
      open={!!submission}
      onOpenChange={(open) => {
        if (!open) setActionMode('select');
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Verifikasi Pengajuan</DialogTitle>
          <DialogDescription>
            {submission && (
              <>
                <strong>{toTitleCase(submission.umkm.businessName)}</strong> mengajukan {submission.products.length} produk: {submission.products.map((p) => toTitleCase(p.product.name)).join(', ')}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {actionMode === 'select' && (
          <div className="flex flex-col gap-3">
            <button type="button" onClick={() => setActionMode('approve')} className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5">
              <ShieldCheck className="size-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">Setujui & Tugaskan</p>
                <p className="text-xs text-muted-foreground">Terima pengajuan dan tugaskan Pendamping.</p>
              </div>
            </button>

            <button type="button" onClick={() => setActionMode('reject')} className="flex items-center gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:border-destructive hover:bg-destructive/5">
              <XCircle className="size-5 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-foreground">Tolak Pengajuan</p>
                <p className="text-xs text-muted-foreground">Tolak dengan catatan alasan penolakan.</p>
              </div>
            </button>
          </div>
        )}

        {actionMode === 'approve' && (
          <div className="flex flex-col gap-4">
            <button type="button" onClick={handleBack} disabled={isLoading} className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" />
              Kembali pilih aksi
            </button>

            <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 p-4 dark:bg-emerald-950/10">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="size-4" />
                Setujui & Tugaskan
              </h4>
              <div className="flex flex-col gap-3">
                {!isOverriding && submission?.pendamping ? (
                  <div className="flex flex-col gap-1.5">
                    <Label>Pendamping</Label>
                    <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm">
                      <span>
                        <span className="text-muted-foreground">Dipilih UMKM: </span>
                        <span className="font-medium">{toTitleCase(submission.pendamping.name)}</span>
                      </span>
                      <button type="button" className="shrink-0 text-xs font-medium text-primary hover:underline" onClick={() => setIsOverriding(true)} disabled={isLoading}>
                        Ganti
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <Label>Pendamping</Label>
                    <Select
                      value={pendampingId}
                      onValueChange={(value) => setPendampingId(value ?? '')}
                      disabled={isLoading}
                      onOpenChange={(open) => {
                        if (!open) setPendampingSearch('');
                      }}
                    >
                      <SelectTrigger className="w-full">
                        {pendampingId ? (
                          <SelectValue>
                            {(() => {
                              const p = pendampingOptions.find((opt) => opt.id === pendampingId);
                              return p ? `${toTitleCase(p.name)} — ${toTitleCase(p.lp3h.name)}` : '';
                            })()}
                          </SelectValue>
                        ) : (
                          <SelectValue placeholder="Pilih Pendamping" />
                        )}
                      </SelectTrigger>
                      <SelectContent>
                        <div className="p-1.5">
                          <Input placeholder="Cari nama, kabupaten, atau kecamatan..." value={pendampingSearch} onChange={(e) => setPendampingSearch(e.target.value)} onKeyDown={(e) => e.stopPropagation()} className="h-8" />
                        </div>
                        {(() => {
                          const q = pendampingSearch.toLowerCase();
                          const filtered = pendampingOptions.filter((p) => p.name.toLowerCase().includes(q) || (p.kabupaten ?? '').toLowerCase().includes(q) || (p.kecamatan ?? '').toLowerCase().includes(q));
                          if (pendampingOptions.length === 0) {
                            return <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>;
                          }
                          if (filtered.length === 0) {
                            return <p className="px-2 py-3 text-center text-sm text-muted-foreground">Tidak ada Pendamping yang cocok</p>;
                          }
                          return filtered.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              <div className="flex flex-col gap-0.5 py-0.5">
                                <span>
                                  {toTitleCase(p.name)} — {toTitleCase(p.lp3h.name)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {[p.kecamatan, p.kabupaten]
                                    .filter((v): v is string => Boolean(v))
                                    .map((v) => toTitleCase(v))
                                    .join(', ') || 'Lokasi belum diisi'}
                                  {' · '}
                                  {p.activeUmkmCount} UMKM aktif
                                </span>
                              </div>
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                    {submission?.pendamping && (
                      <button
                        type="button"
                        className="w-fit text-xs font-medium text-muted-foreground hover:text-foreground hover:underline"
                        onClick={() => {
                          setIsOverriding(false);
                          setPendampingId('');
                        }}
                        disabled={isLoading}
                      >
                        Batal, gunakan pilihan UMKM ({toTitleCase(submission.pendamping.name)})
                      </button>
                    )}
                  </div>
                )}

                <Button type="button" disabled={isLoading} onClick={handleApprove} className="w-fit">
                  {isLoading ? 'Memproses...' : 'Setujui & Tugaskan'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {actionMode === 'reject' && (
          <div className="flex flex-col gap-4">
            <button type="button" onClick={handleBack} disabled={isLoading} className="flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowLeft className="size-3.5" />
              Kembali pilih aksi
            </button>

            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-destructive">
                <XCircle className="size-4" />
                Tolak Pengajuan
              </h4>
              <div className="flex flex-col gap-3">
                <Textarea rows={3} placeholder="Contoh: Foto produk kurang jelas, mohon unggah ulang" disabled={isLoading} value={adminNote} onChange={(e) => setAdminNote(e.target.value)} />
                <Button type="button" variant="outline" disabled={isLoading} onClick={handleReject} className="w-fit border-destructive text-destructive hover:bg-destructive/10">
                  {isLoading ? 'Memproses...' : 'Tolak Pengajuan'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
