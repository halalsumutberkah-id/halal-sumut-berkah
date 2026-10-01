// components/umkm/products/bulk-product-form-dialog.tsx

'use client';

import { useEffect, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Plus, Trash2, Info, ShieldCheck, FileCheck } from 'lucide-react';
import { bulkProductSchema } from '@/schemas/bulk-product.schema';
import { productSchema } from '@/schemas/product.schema';
import { uploadImage, formatErrorMessage } from '@/lib/upload-file';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';
import { DeferredFileField } from '@/components/deferred-file-field';

interface Category {
  id: string;
  name: string;
}

interface BulkProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
    .replace(/\bslhs\b/gi, 'SLHS')
    .replace(/\bpt\b/gi, 'PT')
    .replace(/\bcv\b/gi, 'CV')
    .replace(/\bud\b/gi, 'UD')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

function countWords(str: string): number {
  return str.trim() ? str.trim().split(/\s+/).length : 0;
}

const emptyProductItem = {
  name: '',
  price: 0,
  photoUrl: null as DeferredImageValue,
  shortDescription: '',
  advantages: '',
  ingredients: '',
  productionProcess: '',
  pirtNumber: '',
  pirtUrl: null as DeferredImageValue,
  bpomNumber: '',
  bpomUrl: null as DeferredImageValue,
  hakiNumber: '',
  hakiUrl: null as DeferredImageValue,
  slhsNumber: '',
  slhsUrl: null as DeferredImageValue,
};

const emptyValues = {
  categoryId: '',
  halalCertNumber: '',
  halalCertUrl: null as File | null,
  products: [{ ...emptyProductItem }, { ...emptyProductItem }],
};

function validateProductItemField(name: keyof typeof productSchema.shape, value: unknown) {
  const schema = productSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

function formatRupiahDisplay(value: number) {
  if (!value) return '';
  return `Rp ${value.toLocaleString('id-ID')}`;
}

export function BulkProductFormDialog({ open, onOpenChange, categories, onSuccess }: BulkProductFormDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [hasHalalCert, setHasHalalCert] = useState<'yes' | 'no'>('no');

  const form = useForm({
    defaultValues: emptyValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      if (value.products.length < 2) {
        toast.error('Minimal 2 produk untuk mode tambah grup');
        return;
      }

      setIsLoading(true);
      try {
        const resolve = (val: DeferredImageValue, folder: string) => (val instanceof File ? uploadImage(val, folder) : Promise.resolve(val));

        const isHalal = hasHalalCert === 'yes';
        const halalCertUrl = isHalal && value.halalCertUrl instanceof File ? await uploadImage(value.halalCertUrl, 'product-permits') : '';

        const resolvedProducts = await Promise.all(
          value.products.map(async (item) => {
            const [photoUrl, pirtUrl, bpomUrl, hakiUrl, slhsUrl] = await Promise.all([
              resolve(item.photoUrl, 'product-photos'),
              resolve(item.pirtUrl, 'product-permits'),
              resolve(item.bpomUrl, 'product-permits'),
              resolve(item.hakiUrl, 'product-permits'),
              resolve(item.slhsUrl, 'product-permits'),
            ]);
            return {
              ...item,
              name: formatText(item.name),
              photoUrl: photoUrl ?? '',
              pirtUrl: pirtUrl ?? '',
              bpomUrl: bpomUrl ?? '',
              hakiUrl: hakiUrl ?? '',
              slhsUrl: slhsUrl ?? '',
            };
          }),
        );

        const payload = {
          categoryId: value.categoryId,
          halalCertNumber: isHalal ? value.halalCertNumber : '',
          halalCertUrl,
          products: resolvedProducts,
        };

        const parsed = bulkProductSchema.safeParse(payload);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsLoading(false);
          return;
        }

        const res = await fetch('/api/umkm/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(data?.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success(data?.message || 'Produk berhasil ditambahkan');
        onOpenChange(false);
        onSuccess();
      } catch (error) {
        console.error('Bulk product error:', error);
        toast.error(formatErrorMessage(error, 'Gagal mengunggah berkas atau menambahkan grup produk'));
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    if (open) {
      setHasHalalCert('no');
      form.reset(emptyValues);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Tambah Produk (Grup)</DialogTitle>
          <DialogDescription>Buat beberapa varian produk sekaligus (misal: Kopi Americano, Latte, Cappuccino) yang berbagi Kategori dan Sertifikat Halal yang sama. Minimal 2 produk.</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Data Bersama Seluruh Grup
            </h4>
            <div className="flex flex-col gap-4">
              <form.Field name="categoryId">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Kategori Produk</Label>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isLoading}>
                      <SelectTrigger className="w-full bg-card">
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
                  </div>
                )}
              </form.Field>

              <div className="flex flex-col gap-2">
                <Label>Status Sertifikasi Halal Grup Ini</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <label
                    className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      hasHalalCert === 'no' ? 'border-primary bg-card text-foreground shadow-xs' : 'border-border bg-card/60 text-muted-foreground hover:bg-card'
                    }`}
                  >
                    <input type="radio" name="bulkHasHalalCert" value="no" checked={hasHalalCert === 'no'} onChange={() => setHasHalalCert('no')} disabled={isLoading} className="size-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Belum Bersertifikat</span>
                      <span className="text-xs text-muted-foreground">Untuk diajukan ke Self Declare</span>
                    </div>
                  </label>

                  <label
                    className={`flex flex-1 cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                      hasHalalCert === 'yes' ? 'border-primary bg-card text-foreground shadow-xs' : 'border-border bg-card/60 text-muted-foreground hover:bg-card'
                    }`}
                  >
                    <input type="radio" name="bulkHasHalalCert" value="yes" checked={hasHalalCert === 'yes'} onChange={() => setHasHalalCert('yes')} disabled={isLoading} className="size-4 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Sudah Ada Sertifikat Halal</span>
                      <span className="text-xs text-muted-foreground">Langsung tampil di E-Catalog</span>
                    </div>
                  </label>
                </div>
              </div>

              {hasHalalCert === 'no' ? (
                <div className="flex items-start gap-2.5 rounded-md border border-blue-200 bg-blue-50/60 p-3 text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/20 dark:text-blue-300">
                  <Info className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs leading-relaxed">
                    Seluruh varian produk di bawah akan disimpan berstatus <strong>Belum Halal</strong>. Anda dapat langsung mengajukan produk-produk ini secara bersamaan di menu <strong>Self Declare</strong>.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 pt-1 md:grid-cols-2">
                  <form.Field name="halalCertNumber">
                    {(field) => (
                      <div className="flex flex-col gap-1.5">
                        <Label>Nomor Sertifikat Halal (Sama untuk semua varian)</Label>
                        <Input
                          placeholder="ID00110000012345678"
                          maxLength={19}
                          disabled={isLoading}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                          className="bg-card"
                        />
                      </div>
                    )}
                  </form.Field>

                  <form.Field name="halalCertUrl">
                    {(field) => (
                      <DeferredFileField
                        label="Upload Sertifikat Halal"
                        description="Format: PDF atau gambar JPG/PNG/WEBP, maksimal 3 MB."
                        value={field.state.value}
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
          </div>

          <form.Field name="products" mode="array">
            {(productsField) => (
              <div className="flex flex-col gap-4">
                {productsField.state.value.map((_, index) => (
                  <div key={index} className="flex flex-col gap-4 rounded-lg border p-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-sm font-semibold">Produk #{index + 1}</h4>
                      <Button type="button" variant="ghost" size="icon-sm" disabled={isLoading || productsField.state.value.length <= 2} onClick={() => productsField.removeValue(index)} className="text-destructive hover:text-destructive">
                        <Trash2 className="size-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <form.Field name={`products[${index}].name`} validators={{ onChange: ({ value }) => validateProductItemField('name', value) }}>
                        {(field) => (
                          <div className="flex flex-col gap-1.5">
                            <Label>Nama Produk</Label>
                            <Input disabled={isLoading} value={field.state.value as string} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                            {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                          </div>
                        )}
                      </form.Field>

                      <form.Field name={`products[${index}].price`} validators={{ onChange: ({ value }) => validateProductItemField('price', value) }}>
                        {(field) => (
                          <div className="flex flex-col gap-1.5">
                            <Label>Harga Satuan</Label>
                            <Input
                              inputMode="numeric"
                              placeholder="Rp 0"
                              disabled={isLoading}
                              value={formatRupiahDisplay(field.state.value as number)}
                              onBlur={field.handleBlur}
                              onChange={(e) => field.handleChange(Number(e.target.value.replace(/\D/g, '')) || 0)}
                            />
                            {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                          </div>
                        )}
                      </form.Field>

                      <div className="md:col-span-2">
                        <form.Field name={`products[${index}].photoUrl`}>
                          {(field) => <DeferredImageField label="Foto Produk (Format: Gambar JPG/PNG/WEBP, Wajib)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}
                        </form.Field>
                      </div>

                      <div className="md:col-span-2">
                        <form.Field name={`products[${index}].shortDescription`} validators={{ onChange: ({ value }) => validateProductItemField('shortDescription', value) }}>
                          {(field) => {
                            const words = countWords((field.state.value as string) || '');
                            return (
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                  <Label>Deskripsi Singkat</Label>
                                  <span className={`text-xs ${words >= 10 ? 'text-muted-foreground' : 'font-medium text-amber-600 dark:text-amber-400'}`}>{words}/10 kata minimum</span>
                                </div>
                                <Textarea rows={2} disabled={isLoading} value={field.state.value as string} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                                {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                              </div>
                            );
                          }}
                        </form.Field>
                      </div>

                      {/* fix: 'advantages' no longer in productSchema, validator dropped */}
                      <div className="md:col-span-2">
                        <form.Field name={`products[${index}].advantages`}>
                          {(field) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Keunggulan Produk</Label>
                              <Textarea rows={2} disabled={isLoading} value={field.state.value as string} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                              {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                            </div>
                          )}
                        </form.Field>
                      </div>

                      {/* fix: 'ingredients' no longer in productSchema, validator dropped */}
                      <div className="md:col-span-2">
                        <form.Field name={`products[${index}].ingredients`}>
                          {(field) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Komposisi/Bahan Produk</Label>
                              <Textarea rows={2} disabled={isLoading} value={field.state.value as string} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                              <p className="text-xs text-muted-foreground">Tuliskan seluruh bahan baku produk secara lengkap untuk proses verifikasi.</p>
                              {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                            </div>
                          )}
                        </form.Field>
                      </div>

                      {/* fix: 'productionProcess' no longer in productSchema, validator dropped */}
                      <div className="md:col-span-2">
                        <form.Field name={`products[${index}].productionProcess`}>
                          {(field) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Alur Pengolahan Produk</Label>
                              <Textarea rows={2} disabled={isLoading} value={field.state.value as string} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                              <p className="text-xs text-muted-foreground">Tuliskan seluruh tahapan produksi secara lengkap untuk proses verifikasi.</p>
                              {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                            </div>
                          )}
                        </form.Field>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h5 className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <FileCheck className="size-3.5 text-primary" />
                        Izin Tambahan Varian Ini (Opsional)
                      </h5>
                      <p className="mb-3 text-[11px] text-muted-foreground">Kosongkan bagian ini jika varian ini belum memiliki nomor izin edar terkait.</p>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <form.Field name={`products[${index}].pirtNumber`} validators={{ onChange: ({ value }) => validateProductItemField('pirtNumber', value) }}>
                          {(field) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Nomor PIRT (15 Digit, Opsional)</Label>
                              <Input
                                inputMode="numeric"
                                maxLength={15}
                                placeholder="15 digit angka"
                                disabled={isLoading}
                                value={field.state.value as string}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                              />
                              {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`products[${index}].pirtUrl`}>
                          {(field) => <DeferredImageField label="Upload PIRT (Format: Gambar JPG/PNG/WEBP, Opsional)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}
                        </form.Field>

                        <form.Field name={`products[${index}].bpomNumber`} validators={{ onChange: ({ value }) => validateProductItemField('bpomNumber', value) }}>
                          {(field) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Nomor BPOM (MD/ML, Opsional)</Label>
                              <Input maxLength={15} placeholder="11-15 karakter" disabled={isLoading} value={field.state.value as string} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.toUpperCase())} />
                              {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`products[${index}].bpomUrl`}>
                          {(field) => <DeferredImageField label="Upload BPOM (Format: Gambar JPG/PNG/WEBP, Opsional)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}
                        </form.Field>

                        <form.Field name={`products[${index}].hakiNumber`} validators={{ onChange: ({ value }) => validateProductItemField('hakiNumber', value) }}>
                          {(field) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Nomor HAKI / Merek (Opsional)</Label>
                              <Input maxLength={15} placeholder="9-15 karakter" disabled={isLoading} value={field.state.value as string} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.toUpperCase())} />
                              {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`products[${index}].hakiUrl`}>
                          {(field) => <DeferredImageField label="Upload HAKI (Format: Gambar JPG/PNG/WEBP, Opsional)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}
                        </form.Field>

                        {/* fix: 'slhsNumber' no longer in productSchema, validator dropped */}
                        <form.Field name={`products[${index}].slhsNumber`}>
                          {(field) => (
                            <div className="flex flex-col gap-1.5">
                              <Label>Nomor SLHS (Laik Higiene, Opsional)</Label>
                              <Input
                                inputMode="numeric"
                                maxLength={14}
                                placeholder="13-14 digit angka"
                                disabled={isLoading}
                                value={field.state.value as string}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                              />
                              {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                            </div>
                          )}
                        </form.Field>
                        <form.Field name={`products[${index}].slhsUrl`}>
                          {(field) => <DeferredImageField label="Upload SLHS (Format: Gambar JPG/PNG/WEBP, Opsional)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isLoading} />}
                        </form.Field>
                      </div>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" disabled={isLoading} onClick={() => productsField.pushValue({ ...emptyProductItem })} className="w-fit">
                  <Plus className="size-4" />
                  Tambah Produk Lagi
                </Button>
              </div>
            )}
          </form.Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading}>
                  {isLoading ? 'Menyimpan...' : 'Simpan Semua Produk'}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
