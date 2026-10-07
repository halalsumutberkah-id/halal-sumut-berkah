// components/admin/lph-entity/lph-entity-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { lphEntitySchema } from '@/schemas/lph-entity.schema';
import { getSumutRegencies, type Regency } from '@/lib/wilayah';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export interface LphEntityRecord {
  id: string;
  name: string;
  description: string | null;
  address: string;
  kabupaten: string;
  phone: string;
  email: string | null;
  registrationNumberBpjph: string | null;
  skValidUntil: string | null;
  inspectionScope: string | null;
  contactWhatsapp: string | null;
}

interface LphEntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lph?: LphEntityRecord | null;
  onSuccess: () => void;
}

const emptyValues = {
  name: '',
  description: '',
  address: '',
  kabupaten: '',
  phone: '',
  email: '',
  registrationNumberBpjph: '',
  skValidUntil: '',
  inspectionScope: '',
  contactWhatsapp: '',
};

// standarisasi penamaan: SELALU diawali "LPH - " diikuti nama lembaga.
// Strip dulu prefix "LPH" yang mungkin sudah diketik user (case-insensitive,
// dengan/tanpa spasi & tanda hubung) biar gak dobel jadi "LPH - LPH - Foo"
function formatLphName(name: string) {
  const titleCased = toTitleCase(name);
  const formatted = titleCased.replace(/\blph\b/gi, 'LPH').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
  const withoutPrefix = formatted.replace(/^LPH\s*-\s*/i, '').trim();
  return withoutPrefix ? `LPH - ${withoutPrefix}` : '';
}

function validateField(name: keyof typeof lphEntitySchema.shape, value: unknown) {
  const schema = lphEntitySchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

export function LphEntityFormDialog({ open, onOpenChange, lph, onSuccess }: LphEntityFormDialogProps) {
  const isEdit = !!lph;
  const [isLoading, setIsLoading] = useState(false);

  // data wilayah nyaris gak pernah berubah - useQuery dengan staleTime
  // panjang, dulu useEffect+fetch manual tanpa cache, jadi tiap komponen
  // ini di-mount ulang selalu fetch baru walau backend-nya sendiri udah
  // di-cache 24 jam
  const { data: regencies = [] } = useQuery({
    queryKey: ['wilayah', 'regencies'],
    queryFn: getSumutRegencies,
    staleTime: 60 * 60 * 1000,
  });

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      const payload = {
        ...value,
        name: formatLphName(value.name),
      };

      const parsed = lphEntitySchema.safeParse(payload);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(isEdit ? `/api/admin/lph-entity/${lph.id}` : '/api/admin/lph-entity', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'LPH berhasil diperbarui' : 'LPH berhasil ditambahkan');
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
        lph
          ? {
              name: formatLphName(lph.name),
              description: lph.description ?? '',
              address: lph.address,
              kabupaten: lph.kabupaten,
              phone: lph.phone,
              email: lph.email ?? '',
              registrationNumberBpjph: lph.registrationNumberBpjph ?? '',
              skValidUntil: lph.skValidUntil ? lph.skValidUntil.slice(0, 10) : '',
              inspectionScope: lph.inspectionScope ?? '',
              contactWhatsapp: lph.contactWhatsapp ?? '',
            }
          : emptyValues,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lph]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit LPH' : 'Tambah LPH Baru'}</DialogTitle>
          <DialogDescription>LPH ini cuma tampil di direktori publik, tidak punya akun login.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="name" validators={{ onChange: ({ value }) => validateField('name', value) }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Nama LPH</Label>
                <Input placeholder="Contoh: Sumatera Utara" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                <p className="text-xs text-muted-foreground">Nama akan otomatis diawali "LPH - " saat disimpan, sesuai standar penamaan.</p>
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="phone" validators={{ onChange: ({ value }) => validateField('phone', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nomor Telepon Resmi</Label>
                  <Input disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="contactWhatsapp" validators={{ onChange: ({ value }) => validateField('contactWhatsapp', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Kontak CS / WhatsApp</Label>
                  <Input inputMode="numeric" maxLength={13} placeholder="08xxxxxxxxxx" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="email" validators={{ onChange: ({ value }) => validateField('email', value) }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Email Resmi Aktif (opsional)</Label>
                <Input type="email" placeholder="contoh@lph.co.id" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.trim())} />
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <form.Field name="registrationNumberBpjph" validators={{ onChange: ({ value }) => validateField('registrationNumberBpjph', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>No. Registrasi BPJPH</Label>
                  <Input disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="skValidUntil" validators={{ onChange: ({ value }) => validateField('skValidUntil', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Masa Berlaku SK</Label>
                  <Input type="date" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>
          </div>

          <form.Field name="inspectionScope" validators={{ onChange: ({ value }) => validateField('inspectionScope', value) }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Lingkup Pemeriksaan</Label>
                <Textarea rows={2} placeholder="Contoh: Makanan & Minuman, Kosmetik, Barang Gunaan" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field name="kabupaten" validators={{ onChange: ({ value }) => validateField('kabupaten', value) }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Kabupaten/Kota</Label>
                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading}>
                  <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{toTitleCase(field.state.value)}</SelectValue> : <SelectValue placeholder="Pilih kabupaten/kota" />}</SelectTrigger>
                  <SelectContent>
                    {regencies.map((r: Regency) => (
                      <SelectItem key={r.id} value={r.name.toLowerCase()}>
                        {toTitleCase(r.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field name="address" validators={{ onChange: ({ value }) => validateField('address', value) }}>
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Alamat Lengkap</Label>
                <Textarea rows={2} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Field name="description">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label>Deskripsi (opsional)</Label>
                <Textarea rows={2} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
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
