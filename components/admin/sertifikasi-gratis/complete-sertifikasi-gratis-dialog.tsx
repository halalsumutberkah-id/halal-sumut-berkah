// components/admin/sertifikasi-gratis/complete-sertifikasi-gratis-dialog.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { completeSertifikasiGratisSchema } from '@/schemas/sertifikasi-gratis.schema';
import { uploadImage } from '@/lib/upload-file';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeferredFileField } from '@/components/deferred-file-field';

export interface CompleteSubmissionRecord {
  id: string;
  umkm: { businessName: string };
  products: { product: { name: string } }[];
}

interface CompleteSertifikasiGratisDialogProps {
  submission: CompleteSubmissionRecord | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CompleteSertifikasiGratisDialog({ submission, onOpenChange, onSuccess }: CompleteSertifikasiGratisDialogProps) {
  const [halalCertNumber, setHalalCertNumber] = useState('');
  const [halalCertFile, setHalalCertFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!submission || isLoading) return;

    setIsLoading(true);
    try {
      const halalCertUrl = halalCertFile instanceof File ? await uploadImage(halalCertFile, 'product-permits') : '';

      const payload = { halalCertNumber, halalCertUrl };
      const parsed = completeSertifikasiGratisSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        setIsLoading(false);
        return;
      }

      const res = await fetch(`/api/admin/sertifikasi-gratis/${submission.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success(data.message || 'Pengajuan berhasil diselesaikan');
      setHalalCertNumber('');
      setHalalCertFile(null);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error('Gagal mengunggah berkas, silakan coba lagi');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={!!submission} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selesaikan Pengajuan</DialogTitle>
          <DialogDescription>
            {submission && (
              <>
                Sertifikat ini akan berlaku untuk SEMUA {submission.products.length} produk milik <strong>{toTitleCase(submission.umkm.businessName)}</strong> dalam pengajuan ini.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Nomor Sertifikat Halal</Label>
            <Input placeholder="ID00110000012345678" maxLength={19} disabled={isLoading} value={halalCertNumber} onChange={(e) => setHalalCertNumber(e.target.value.toUpperCase())} />
            <p className="text-xs text-muted-foreground">19 karakter: diawali huruf ID lalu 17 digit angka.</p>
          </div>

          <DeferredFileField
            label="Upload Sertifikat Halal"
            description="Format: PDF atau gambar JPG/PNG/WEBP, maksimal 3 MB."
            value={halalCertFile}
            onChange={setHalalCertFile}
            disabled={isLoading}
            accept="application/pdf,image/jpeg,image/png,image/webp"
            maxSizeMB={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? 'Menyimpan...' : 'Selesaikan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
