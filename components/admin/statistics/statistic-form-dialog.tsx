// components/admin/statistics/statistic-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { statisticSchema } from '@/schemas/statistic.schema';
import { KABUPATEN_OPTIONS } from '@/lib/statistics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface StatisticRecord {
  id: string;
  period: string;
  kabupaten: string;
  certifiedCount: number;
}

interface StatisticFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statistic?: StatisticRecord | null;
  onSuccess: () => void;
}

const emptyValues = {
  period: '',
  kabupaten: '',
  certifiedCount: 0,
};

function formatThousand(value: number | string): string {
  if (!value && value !== 0) return '';
  const num = typeof value === 'string' ? Number(value.replace(/\D/g, '')) : value;
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('id-ID').format(num);
}

function parseThousand(value: string): number {
  const cleaned = value.replace(/\D/g, '');
  return cleaned === '' ? 0 : Number(cleaned);
}

export function StatisticFormDialog({ open, onOpenChange, statistic, onSuccess }: StatisticFormDialogProps) {
  const isEdit = !!statistic;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      const parsed = statisticSchema.safeParse(value);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(isEdit ? `/api/admin/statistics/${statistic.id}` : '/api/admin/statistics', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'Data statistik berhasil diperbarui' : 'Data statistik berhasil disimpan');
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
        statistic
          ? {
              period: statistic.period,
              kabupaten: statistic.kabupaten,
              certifiedCount: statistic.certifiedCount,
            }
          : emptyValues,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, statistic]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Data Statistik' : 'Tambah Data Statistik'}</DialogTitle>
          <DialogDescription>Jumlah UMKM tersertifikasi halal untuk periode dan wilayah tertentu. Jika kombinasi periode & kabupaten sudah ada, data akan diperbarui.</DialogDescription>
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
            name="period"
            validators={{
              onChange: ({ value }) => {
                const result = statisticSchema.shape.period.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Periode</Label>
                <Input id={field.name} type="month" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field
            name="kabupaten"
            validators={{
              onChange: ({ value }) => {
                const result = statisticSchema.shape.kabupaten.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Wilayah</Label>
                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading}>
                  <SelectTrigger id={field.name} className="w-full">
                    {field.state.value ? <SelectValue>{field.state.value}</SelectValue> : <SelectValue placeholder="Pilih wilayah" />}
                  </SelectTrigger>
                  <SelectContent>
                    {KABUPATEN_OPTIONS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {/* Input dengan auto Thousand Separator */}
          <form.Field
            name="certifiedCount"
            validators={{
              onChange: ({ value }) => {
                const result = statisticSchema.shape.certifiedCount.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Jumlah UMKM Tersertifikasi</Label>
                <Input
                  id={field.name}
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  disabled={isLoading}
                  value={formatThousand(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const rawNumber = parseThousand(e.target.value);
                    field.handleChange(rawNumber);
                  }}
                />
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
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
