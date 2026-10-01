'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { createLp3hSchema, updateLp3hSchema } from '@/schemas/lp3h.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AddressField } from '@/components/shared/address-field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toTitleCase } from '@/lib/title-case';

export interface Lp3hRecord {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string | null;
  user: { email: string };
}

interface Lp3hFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lp3h?: Lp3hRecord | null;
  onCreated: (credentials: { email: string; password: string }) => void;
  onUpdated: () => void;
}

const emptyValues = { name: '', email: '', address: '', phone: '', description: '' };

const LP3H_PREFIX = 'LP3H -';

function formatLp3hName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\blp3h\b/gi, 'LP3H').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

function stripLp3hPrefix(value: string) {
  return value.replace(/^lp3h\s*-\s*/i, '');
}

export function Lp3hFormDialog({ open, onOpenChange, lp3h, onCreated, onUpdated }: Lp3hFormDialogProps) {
  const isEdit = !!lp3h;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      const formattedName = formatLp3hName(value.name);
      const schema = isEdit ? updateLp3hSchema : createLp3hSchema;
      const payload = isEdit ? { name: formattedName, address: value.address, phone: value.phone, description: value.description } : { ...value, name: formattedName };

      const parsed = schema.safeParse(payload);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(isEdit ? `/api/admin/lp3h/${lp3h.id}` : '/api/admin/lp3h', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        if (isEdit) {
          toast.success('Data LP3H berhasil diperbarui');
          onUpdated();
          onOpenChange(false);
        } else {
          onOpenChange(false);
          onCreated(data.credentials);
        }
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
        lp3h
          ? {
              name: formatLp3hName(lp3h.name),
              email: lp3h.user.email,
              address: lp3h.address,
              phone: lp3h.phone,
              description: lp3h.description ?? '',
            }
          : emptyValues,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lp3h]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit LP3H' : 'Tambah LP3H Baru'}</DialogTitle>
          <DialogDescription>{isEdit ? 'Perbarui data lembaga pendamping proses produk halal.' : 'Password akan digenerate otomatis dan ditampilkan sekali setelah disimpan.'}</DialogDescription>
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
                const result = createLp3hSchema.shape.name.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Nama LP3H</Label>
                <div className="flex gap-2">
                  <div className="flex shrink-0 select-none items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">{LP3H_PREFIX}</div>
                  <Input
                    id={field.name}
                    disabled={isLoading}
                    value={stripLp3hPrefix(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(`${LP3H_PREFIX} ${e.target.value}`)}
                    placeholder="Sumatera Utara"
                    className="flex-1"
                  />
                </div>
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          {!isEdit && (
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const result = createLp3hSchema.shape.email.safeParse(value);
                  return result.success ? undefined : result.error.issues[0].message;
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={field.name}>Email</Label>
                  <Input id={field.name} type="email" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>
          )}

          <form.Field
            name="phone"
            validators={{
              onChange: ({ value }) => {
                const result = createLp3hSchema.shape.phone.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Nomor Telepon</Label>
                <Input
                  id={field.name}
                  inputMode="numeric"
                  maxLength={13}
                  placeholder="08xxxxxxxxxx"
                  disabled={isLoading}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                />
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field
            name="address"
            validators={{
              onChange: ({ value }) => {
                const result = createLp3hSchema.shape.address.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => <AddressField key={lp3h?.id ?? 'new'} value={field.state.value} onChange={field.handleChange} disabled={isLoading} error={field.state.meta.errors[0]} />}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Deskripsi (opsional)</Label>
                <Textarea id={field.name} rows={2} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
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
