// components/admin/banners/banner-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { bannerSchema } from '@/schemas/banner.schema';
import { uploadImage } from '@/lib/upload-file';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';

export interface BannerRecord {
  id: string;
  imageUrl: string;
  link: string | null;
  sequence: number;
  isActive: boolean;
}

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: BannerRecord | null;
  onSuccess: () => void;
}

const emptyValues = {
  imageUrl: null as DeferredImageValue,
  link: '',
  sequence: 0,
  isActive: true,
};

// Fungsi validasi rasio 4:5 (portrait)
function validateImageRatio(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const ratio = img.width / img.height;
      // Rasio ideal 4/5 = 0.8 (toleransi 0.72 - 0.88)
      if (ratio < 0.72 || ratio > 0.88) {
        toast.error(`Rasio gambar tidak sesuai. Gunakan rasio 4:5 portrait (contoh: 800x1000 atau 1080x1350 px). Ukuran file Anda: ${img.width}x${img.height} px`);
        resolve(false);
      } else {
        resolve(true);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

export function BannerFormDialog({ open, onOpenChange, banner, onSuccess }: BannerFormDialogProps) {
  const isEdit = !!banner;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      if (!value.imageUrl) {
        toast.error('Gambar wajib diunggah');
        return;
      }

      // Jalankan validasi rasio jika user memilih file baru
      if (value.imageUrl instanceof File) {
        const isValidRatio = await validateImageRatio(value.imageUrl);
        if (!isValidRatio) return;
      }

      setIsLoading(true);
      try {
        const imageUrl = value.imageUrl instanceof File ? await uploadImage(value.imageUrl, 'banners') : value.imageUrl;

        const payload = { ...value, imageUrl: imageUrl ?? '' };

        const parsed = bannerSchema.safeParse(payload);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsLoading(false);
          return;
        }

        const res = await fetch(isEdit ? `/api/admin/banners/${banner.id}` : '/api/admin/banners', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'Banner berhasil diperbarui' : 'Banner berhasil ditambahkan');
        onOpenChange(false);
        onSuccess();
      } catch {
        toast.error('Gagal mengunggah gambar, silakan coba lagi');
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        banner
          ? {
              imageUrl: banner.imageUrl,
              link: banner.link ?? '',
              sequence: banner.sequence,
              isActive: banner.isActive,
            }
          : emptyValues,
      );
    }
  }, [open, banner]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Banner' : 'Tambah Banner Baru'}</DialogTitle>
          <DialogDescription>Banner pop-up menggunakan format portrait 4:5 (rekomendasi: 1080x1350 px).</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="imageUrl">
            {(field) => (
              <div className="flex flex-col gap-1">
                <DeferredImageField label="Gambar Banner" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />
                <p className="text-[11px] text-muted-foreground">Format: JPG, PNG, WEBP. Wajib rasio 4:5.</p>
              </div>
            )}
          </form.Field>

          <form.Field
            name="link"
            validators={{
              onChange: ({ value }) => {
                const result = bannerSchema.shape.link.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Link Tujuan (opsional)</Label>
                <Input placeholder="https://..." disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field
            name="sequence"
            validators={{
              onChange: ({ value }) => {
                const result = bannerSchema.shape.sequence.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Urutan Tampil</Label>
                <Input type="number" min={0} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(Number(e.target.value))} />
                <p className="text-xs text-muted-foreground">Angka lebih kecil tampil lebih dulu di slider.</p>
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field name="isActive">
            {(field) => (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label>Publish Banner</Label>
                  <p className="text-xs text-muted-foreground">Banner yang tidak di-publish tidak akan tampil di beranda.</p>
                </div>
                <Switch checked={field.state.value} onCheckedChange={(checked) => field.handleChange(checked)} disabled={isLoading} />
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
