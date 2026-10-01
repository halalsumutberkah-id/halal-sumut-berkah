// components/umkm/products/product-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Info, ShieldCheck, FileCheck, Package } from 'lucide-react';
import { productSchema } from '@/schemas/product.schema';
import { uploadImage, formatErrorMessage } from '@/lib/upload-file';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';
import { DeferredFileField } from '@/components/deferred-file-field';
import { toTitleCase } from '@/lib/title-case';

interface Category {
  id: string;
  name: string;
}

export interface ProductRecord {
  id: string;
  name: string;
  price: number;
  categoryId: string;
  shortDescription: string | null;
  photoUrl: string | null;
  halalCertNumber: string | null;
  halalCertUrl: string | null;
  pirtNumber: string | null;
  bpomNumber: string | null;
  hakiNumber: string | null;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductRecord | null;
  categories: Category[];
  onSuccess: () => void;
}

function formatText(text: string) {
  const titleCased = toTitleCase(text);
  return titleCased
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\bbpom\b/gi, 'BPOM')
    .replace(/\bpirt\b/gi, 'PIRT')
    .replace(/\bhaki\b/gi, 'HAKI')
    .replace(/\bpt\b/gi, 'PT')
    .replace(/\bcv\b/gi, 'CV')
    .replace(/\bud\b/gi, 'UD')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

function countWords(str: string): number {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

const emptyValues = {
  name: '',
  price: 0,
  categoryId: '',
  shortDescription: '',
  photoUrl: null as DeferredImageValue,
  halalCertNumber: '',
  halalCertUrl: null as DeferredImageValue,
  pirtNumber: '',
  bpomNumber: '',
  hakiNumber: '',
};

function validateField(name: keyof typeof productSchema.shape, value: unknown) {
  const schema = productSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

function formatRupiahDisplay(value: number) {
  if (!value) return '';
  return `Rp ${value.toLocaleString('id-ID')}`;
}

function SectionHeader({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div>
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

export function ProductFormDialog({ open, onOpenChange, product, categories, onSuccess }: ProductFormDialogProps) {
  const isEdit = !!product;
  const [isLoading, setIsLoading] = useState(false);
  const [hasHalalCert, setHasHalalCert] = useState<'yes' | 'no'>('no');

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      if (!value.photoUrl) {
        toast.error('Foto produk wajib diunggah');
        return;
      }

      setIsLoading(true);
      try {
        const resolve = (val: DeferredImageValue, folder: string) => (val instanceof File ? uploadImage(val, folder) : Promise.resolve(val));

        const isHalal = hasHalalCert === 'yes';

        const [photoUrl, halalCertUrl] = await Promise.all([resolve(value.photoUrl, 'product-photos'), isHalal ? resolve(value.halalCertUrl, 'product-permits') : Promise.resolve(null)]);

        const payload = {
          ...value,
          name: formatText(value.name),
          photoUrl: photoUrl ?? '',
          halalCertNumber: isHalal ? value.halalCertNumber : '',
          halalCertUrl: isHalal ? (halalCertUrl ?? '') : '',
        };

        const parsed = productSchema.safeParse(payload);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsLoading(false);
          return;
        }

        const res = await fetch(isEdit ? `/api/umkm/products/${product.id}` : '/api/umkm/products', {
          method: isEdit ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(data?.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(isEdit ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
        onOpenChange(false);
        onSuccess();
      } catch (error) {
        console.error('Product save error:', error);
        toast.error(formatErrorMessage(error, 'Gagal mengunggah berkas atau menyimpan produk'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      const hasCert = Boolean(product?.halalCertNumber || product?.halalCertUrl);
      setHasHalalCert(hasCert ? 'yes' : 'no');

      form.reset(
        product
          ? {
              name: formatText(product.name),
              price: product.price,
              categoryId: product.categoryId,
              shortDescription: product.shortDescription ?? '',
              photoUrl: product.photoUrl ?? null,
              halalCertNumber: product.halalCertNumber ?? '',
              halalCertUrl: product.halalCertUrl ?? null,
              pirtNumber: product.pirtNumber ?? '',
              bpomNumber: product.bpomNumber ?? '',
              hakiNumber: product.hakiNumber ?? '',
            }
          : emptyValues,
      );
    }
  }, [open, product]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
          <DialogDescription>
            Lengkapi data produk Anda. Berkas foto & dokumen baru akan diunggah setelah Anda menekan tombol Simpan.
            {!isEdit && ' Data ini akan ditampilkan secara publik.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-6"
        >
          {/* Informasi Dasar */}
          <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
            <SectionHeader icon={Package} title="Informasi Dasar" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field name="name" validators={{ onChange: ({ value }) => validateField('name', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <Label>Nama Produk</Label>
                    <Input disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="categoryId" validators={{ onChange: ({ value }) => validateField('categoryId', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Kategori Produk</Label>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading}>
                      <SelectTrigger className="w-full">
                        {field.state.value ? <SelectValue>{formatText(categories.find((c) => c.id === field.state.value)?.name ?? '')}</SelectValue> : <SelectValue placeholder="Pilih kategori" />}
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
                        ) : (
                          categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {formatText(cat.name)}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="price" validators={{ onChange: ({ value }) => validateField('price', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Harga Satuan</Label>
                    <Input
                      inputMode="numeric"
                      placeholder="Rp 0"
                      disabled={isLoading}
                      value={formatRupiahDisplay(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
                    />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <div className="md:col-span-2">
                <form.Field name="photoUrl">
                  {(field) => <DeferredImageField label="Foto Produk (Format: Gambar JPG/PNG/WEBP, Wajib)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}
                </form.Field>
              </div>

              <div className="md:col-span-2">
                <form.Field name="shortDescription" validators={{ onChange: ({ value }) => validateField('shortDescription', value) }}>
                  {(field) => {
                    const words = countWords(field.state.value);
                    return (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label>Deskripsi Singkat</Label>
                          <span className={`text-xs ${words >= 10 ? 'text-muted-foreground' : 'font-medium text-amber-600 dark:text-amber-400'}`}>{words}/10 kata minimum</span>
                        </div>
                        <Textarea rows={3} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                        {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                      </div>
                    );
                  }}
                </form.Field>
              </div>
            </div>
          </div>

          {/* Status Sertifikasi Halal */}
          <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/20 p-4">
            <SectionHeader icon={ShieldCheck} title="Status Sertifikasi Halal" />

            <div className="flex flex-col gap-2 sm:flex-row">
              <label
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  hasHalalCert === 'no' ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <input type="radio" name="hasHalalCert" value="no" checked={hasHalalCert === 'no'} onChange={() => setHasHalalCert('no')} disabled={isLoading} className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Belum Bersertifikat</span>
                  <span className="text-xs text-muted-foreground">Untuk diajukan ke program Sertifikasi Halal Gratis</span>
                </div>
              </label>

              <label
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  hasHalalCert === 'yes' ? 'border-primary bg-primary/5 text-foreground' : 'border-border bg-card text-muted-foreground hover:bg-muted/40'
                }`}
              >
                <input type="radio" name="hasHalalCert" value="yes" checked={hasHalalCert === 'yes'} onChange={() => setHasHalalCert('yes')} disabled={isLoading} className="size-4 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Sudah Bersertifikat Halal</span>
                  <span className="text-xs text-muted-foreground">Untuk dipublikasikan langsung ke E-Catalog</span>
                </div>
              </label>
            </div>

            {hasHalalCert === 'no' ? (
              <div className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-blue-50/50 p-3 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
                <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <p className="text-xs leading-relaxed">
                  Produk akan tersimpan sebagai <strong>Belum Halal</strong>. Setelah disimpan, Anda dapat langsung mengajukannya ke menu <strong>Self Declare</strong> untuk diproses secara gratis.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <form.Field name="halalCertNumber" validators={{ onChange: ({ value }) => (hasHalalCert === 'yes' ? validateField('halalCertNumber', value) : undefined) }}>
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label>Nomor Sertifikat Halal</Label>
                      <Input placeholder="ID00110000012345678" maxLength={19} disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.toUpperCase())} />
                      <p className="text-xs text-muted-foreground">19 karakter resmi BPJPH: huruf ID diikuti 17 digit angka.</p>
                      {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                    </div>
                  )}
                </form.Field>

                <form.Field name="halalCertUrl">
                  {(field) => (
                    <DeferredFileField
                      label="Upload Sertifikat Halal"
                      description="Format: PDF atau gambar JPG/PNG/WEBP, maksimal 3 MB."
                      value={field.state.value as any}
                      onChange={field.handleChange}
                      disabled={isLoading}
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      maxSizeMB={3}
                    />
                  )}
                </form.Field>
              </div>
            )}
          </div>

          {/* Izin Tambahan - cuma nomor, tanpa upload dokumen */}
          <div className="flex flex-col gap-4 rounded-lg border border-border p-4">
            <SectionHeader icon={FileCheck} title="Izin Tambahan (Opsional)" description="Kosongkan jika produk belum memiliki izin/legalitas di bawah ini. Nomor yang diisi akan ditampilkan di profil publik." />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <form.Field name="pirtNumber" validators={{ onChange: ({ value }) => validateField('pirtNumber', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nomor PIRT</Label>
                    <Input placeholder="Nomor PIRT" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="bpomNumber" validators={{ onChange: ({ value }) => validateField('bpomNumber', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nomor BPOM (MD/ML)</Label>
                    <Input placeholder="Nomor BPOM" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.toUpperCase())} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="hakiNumber" validators={{ onChange: ({ value }) => validateField('hakiNumber', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nomor HAKI / Merek</Label>
                    <Input placeholder="Nomor HAKI / Merek" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.toUpperCase())} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
