// components/admin/fasilitasi-code/fasilitasi-code-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { createFasilitasiCodeSchema } from '@/schemas/fasilitasi-code.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface FasilitasiCodeRecord {
  id: string;
  code: string;
  quota: number;
  isActive: boolean;
  _count?: { submissions: number };
}

interface FasilitasiCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fasilitasiCode?: FasilitasiCodeRecord | null;
  onSuccess: () => void;
}

const emptyValues = {
  code: '',
  quota: 100,
  isActive: true,
};

function validateField(name: keyof typeof createFasilitasiCodeSchema.shape, value: unknown) {
  const schema = createFasilitasiCodeSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

export function FasilitasiCodeFormDialog({ open, onOpenChange, fasilitasiCode, onSuccess }: FasilitasiCodeFormDialogProps) {
  const isEdit = !!fasilitasiCode;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      const payload = { ...value, code: value.code.toUpperCase() };
      const parsed = createFasilitasiCodeSchema.safeParse(payload);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(isEdit ? `/api/admin/fasilitasi-code/${fasilitasiCode.id}` : '/api/admin/fasilitasi-code', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'Kode Fasilitasi berhasil diperbarui' : 'Kode Fasilitasi berhasil ditambahkan');
        onOpenChange(false);
        onSuccess();
      } catch {
        toast.error('Terjadi kesalahan pada server');
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        fasilitasiCode
          ? {
              code: fasilitasiCode.code,
              quota: fasilitasiCode.quota,
              isActive: fasilitasiCode.isActive,
            }
          : emptyValues,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, fasilitasiCode]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Kode Fasilitasi' : 'Tambah Kode Fasilitasi'}</DialogTitle>
          <DialogDescription>Kode ini dipakai secara manual oleh Pendamping (P3H) saat memproses pengajuan di portal SIHALAL - sistem ini tidak memvalidasi kode, cuma menyimpannya sebagai referensi.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="code" validators={{ onChange: ({ value }) => validateField('code', value) }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Kode</Label>
                <Input placeholder="Contoh: PROMO-2025-A" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.toUpperCase())} />
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field name="quota" validators={{ onChange: ({ value }) => validateField('quota', value) }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Kuota (jumlah UMKM)</Label>
                <Input type="number" min={1} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(Number(e.target.value) || 0)} />
                {isEdit && fasilitasiCode?._count && <p className="text-xs text-muted-foreground">Sudah terpakai: {fasilitasiCode._count.submissions} UMKM.</p>}
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field name="isActive">
            {(field) => (
              <label className="flex cursor-pointer items-center gap-2">
                <Checkbox checked={field.state.value} onCheckedChange={(v) => field.handleChange(!!v)} disabled={isLoading} />
                <span className="text-sm">Aktifkan kode ini (ikut dialokasikan otomatis ke pengajuan baru)</span>
              </label>
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
