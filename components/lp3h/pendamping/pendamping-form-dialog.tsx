'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { pendampingSchema } from '@/schemas/pendamping.schema';
import { uploadImage, uploadDocument } from '@/lib/upload-file';
import { KabupatenKecamatanField } from '@/components/shared/kabupaten-kecamatan-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';
import { DeferredFileField } from '@/components/deferred-file-field';
import { toTitleCase } from '@/lib/title-case';

export interface PendampingRecord {
  id: string;
  name: string;
  phone: string;
  photoUrl: string | null;
  nikP3h: string | null;
  jenisKelamin: string | null;
  emailP3h: string | null;
  kecamatan: string | null;
  kabupaten: string | null;
  alamatDetail: string | null;
  ktpUrl: string | null;
  registrasiSihalalUrl: string | null;
  registrasiBpjphUrl: string | null;
  sertifikatPelatihanUrl: string | null;
}

interface PendampingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendamping?: PendampingRecord | null;
  onSuccess: () => void;
  apiBasePath?: string;
}

function formatText(text: string) {
  const titleCased = toTitleCase(text);
  return titleCased
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bp3h\b/gi, 'P3H')
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

const emptyValues = {
  name: '',
  phone: '',
  photoUrl: null as DeferredImageValue,
  nikP3h: '',
  jenisKelamin: '' as 'L' | 'P' | '',
  emailP3h: '',
  kecamatan: '',
  kabupaten: '',
  alamatDetail: '',
  ktpUrl: null as DeferredImageValue,
  registrasiSihalalUrl: null as DeferredImageValue,
  registrasiBpjphUrl: null as DeferredImageValue,
  sertifikatPelatihanUrl: null as DeferredImageValue,
};

function validateField(name: keyof typeof pendampingSchema.shape, value: unknown) {
  const schema = pendampingSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

export function PendampingFormDialog({ open, onOpenChange, pendamping, onSuccess, apiBasePath = '/api/lp3h/pendamping' }: PendampingFormDialogProps) {
  const isEdit = !!pendamping;
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      setIsLoading(true);
      try {
        const resolveImage = (val: DeferredImageValue, folder: string) => (val instanceof File ? uploadImage(val, folder) : Promise.resolve(val));
        const resolveDocument = (val: DeferredImageValue, folder: string) => (val instanceof File ? uploadDocument(val, folder) : Promise.resolve(val));

        const [photoUrl, ktpUrl, registrasiSihalalUrl, registrasiBpjphUrl, sertifikatPelatihanUrl] = await Promise.all([
          resolveImage(value.photoUrl, 'pendamping-photos'),
          resolveImage(value.ktpUrl, 'pendamping-documents'),
          resolveImage(value.registrasiSihalalUrl, 'pendamping-documents'),
          resolveDocument(value.registrasiBpjphUrl, 'pendamping-documents'),
          resolveDocument(value.sertifikatPelatihanUrl, 'pendamping-documents'),
        ]);

        const payload = {
          ...value,
          name: toTitleCase(value.name),
          alamatDetail: value.alamatDetail ? formatText(value.alamatDetail) : '',
          photoUrl: photoUrl ?? '',
          ktpUrl: ktpUrl ?? '',
          registrasiSihalalUrl: registrasiSihalalUrl ?? '',
          registrasiBpjphUrl: registrasiBpjphUrl ?? '',
          sertifikatPelatihanUrl: sertifikatPelatihanUrl ?? '',
          jenisKelamin: value.jenisKelamin || undefined,
        };

        const parsed = pendampingSchema.safeParse(payload);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsLoading(false);
          return;
        }

        const res = await fetch(isEdit ? `${apiBasePath}/${pendamping.id}` : apiBasePath, {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'Pendamping (P3H) berhasil diperbarui' : 'Pendamping (P3H) berhasil ditambahkan');
        onOpenChange(false);
        onSuccess();
      } catch {
        toast.error('Gagal mengunggah berkas, silakan coba lagi');
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(
        pendamping
          ? {
              name: toTitleCase(pendamping.name),
              phone: pendamping.phone,
              photoUrl: pendamping.photoUrl ?? null,
              nikP3h: pendamping.nikP3h ?? '',
              jenisKelamin: (pendamping.jenisKelamin as 'L' | 'P' | '') ?? '',
              emailP3h: pendamping.emailP3h ?? '',
              kecamatan: pendamping.kecamatan ?? '',
              kabupaten: pendamping.kabupaten ?? '',
              alamatDetail: pendamping.alamatDetail ? formatText(pendamping.alamatDetail) : '',
              ktpUrl: pendamping.ktpUrl ?? null,
              registrasiSihalalUrl: pendamping.registrasiSihalalUrl ?? null,
              registrasiBpjphUrl: pendamping.registrasiBpjphUrl ?? null,
              sertifikatPelatihanUrl: pendamping.sertifikatPelatihanUrl ?? null,
            }
          : emptyValues,
      );
    }
  }, [open, pendamping]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Pendamping (P3H)' : 'Tambah Pendamping (P3H) Baru'}</DialogTitle>
          <DialogDescription>Lengkapi data Pendamping (P3H). Foto/dokumen bisa dilengkapi sekarang atau nanti.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div className="border-b pb-1">
            <h4 className="text-sm font-semibold">Data Diri</h4>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="name" validators={{ onChange: ({ value }) => validateField('name', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nama Lengkap</Label>
                  <Input disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="nikP3h" validators={{ onChange: ({ value }) => validateField('nikP3h', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>NIK</Label>
                  <Input inputMode="numeric" maxLength={16} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="jenisKelamin">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Jenis Kelamin</Label>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange((v as 'L' | 'P') ?? '')} disabled={isLoading}>
                    <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{field.state.value === 'L' ? 'Laki-laki' : 'Perempuan'}</SelectValue> : <SelectValue placeholder="Pilih" />}</SelectTrigger>
                    <SelectContent>
                      <SelectItem value="L">Laki-laki</SelectItem>
                      <SelectItem value="P">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="phone" validators={{ onChange: ({ value }) => validateField('phone', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nomor HP</Label>
                  <Input placeholder="08xxxxxxxxxx" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="emailP3h" validators={{ onChange: ({ value }) => validateField('emailP3h', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Email</Label>
                  <Input type="email" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Email ini akan ditampilkan secara publik.</p>
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="photoUrl">{(field) => <DeferredImageField label="Foto Profil" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}</form.Field>

            <form.Field name="kabupaten" validators={{ onChange: ({ value }) => validateField('kabupaten', value) }}>
              {(kabupatenField) => (
                <form.Field name="kecamatan" validators={{ onChange: ({ value }) => validateField('kecamatan', value) }}>
                  {(kecamatanField) => (
                    <KabupatenKecamatanField
                      kabupatenValue={kabupatenField.state.value}
                      kecamatanValue={kecamatanField.state.value}
                      onKabupatenChange={(v) => kabupatenField.handleChange(v)}
                      onKecamatanChange={(v) => kecamatanField.handleChange(v)}
                      disabled={isLoading}
                      kabupatenError={kabupatenField.state.meta.errors[0]}
                      kecamatanError={kecamatanField.state.meta.errors[0]}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>

            <div className="md:col-span-2">
              <form.Field name="alamatDetail">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Detail Alamat</Label>
                    <Textarea rows={2} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="md:col-span-2">
              <form.Field name="ktpUrl">{(field) => <DeferredImageField label="Upload KTP" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}</form.Field>
            </div>
          </div>

          <div className="border-b pb-1 pt-2">
            <h4 className="text-sm font-semibold">Legalitas P3H</h4>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="registrasiSihalalUrl" validators={{ onChange: ({ value }) => (value ? undefined : 'Bukti screenshot registrasi SIHALAL wajib diunggah') }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <DeferredImageField label="Upload Bukti Screenshot Nomor Registrasi SIHALAL (JPG/PNG/JPEG)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />
                  <p className="text-xs text-muted-foreground">Tangkapan layar halaman SIHALAL yang menampilkan nomor registrasi. File ini akan diverifikasi oleh admin.</p>
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="registrasiBpjphUrl" validators={{ onChange: ({ value }) => (value ? undefined : 'Dokumen registrasi BPJPH wajib diunggah') }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <DeferredFileField
                    label="Upload Registrasi Resmi BPJPH"
                    description="Format: Dokumen PDF, maksimal 3 MB. File ini akan diverifikasi oleh admin."
                    value={field.state.value as any}
                    onChange={field.handleChange}
                    disabled={isLoading}
                    accept="application/pdf"
                    maxSizeMB={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    File lebih dari 3 MB? Kompres di{' '}
                    <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                      ilovepdf.com/compress_pdf
                    </a>
                    .
                  </p>
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="sertifikatPelatihanUrl" validators={{ onChange: ({ value }) => (value ? undefined : 'Sertifikat pelatihan P3H wajib diunggah') }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <DeferredFileField
                    label="Upload File Sertifikat Pelatihan P3H"
                    description="Format: Dokumen PDF, maksimal 3 MB. File ini akan diverifikasi oleh admin."
                    value={field.state.value as any}
                    onChange={field.handleChange}
                    disabled={isLoading}
                    accept="application/pdf"
                    maxSizeMB={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    File lebih dari 3 MB? Kompres di{' '}
                    <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                      ilovepdf.com/compress_pdf
                    </a>
                    .
                  </p>
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>
          </div>

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
