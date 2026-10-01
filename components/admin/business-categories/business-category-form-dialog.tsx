// components/admin/business-categories/business-category-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { businessCategorySchema } from '@/schemas/business-category.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface BusinessCategoryRecord {
  id: string;
  name: string;
}

interface BusinessCategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: BusinessCategoryRecord | null;
  onSuccess: () => void;
}

export function BusinessCategoryFormDialog({ open, onOpenChange, category, onSuccess }: BusinessCategoryFormDialogProps) {
  const isEdit = !!category;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      const parsed = businessCategorySchema.safeParse(value);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(isEdit ? `/api/admin/business-categories/${category.id}` : '/api/admin/business-categories', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'Kategori usaha berhasil diperbarui' : 'Kategori usaha berhasil ditambahkan');
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
      form.reset({ name: category?.name ?? '' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Kategori Usaha' : 'Tambah Kategori Usaha'}</DialogTitle>
          <DialogDescription>Kategori ini akan muncul di dropdown "Jenis/Sektor/Kategori Usaha" saat UMKM mendaftar.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                const result = businessCategorySchema.shape.name.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Nama Kategori</Label>
                <Input placeholder="Contoh: Kuliner, Fashion, Kerajinan" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
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
