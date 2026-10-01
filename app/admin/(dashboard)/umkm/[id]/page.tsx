// app/admin/umkm/[id]/page.tsx

'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { ArrowLeft, FileText, ExternalLink, Pencil, Trash2, X } from 'lucide-react';
import { updateUmkmProfileSchema } from '@/schemas/umkm-profile.schema';
import { BUSINESS_TYPES } from '@/schemas/register.schema';
import { BUSINESS_TYPE_LABELS } from '@/components/umkm/register/register-shared';
import { KabupatenKecamatanField } from '@/components/shared/kabupaten-kecamatan-field';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';
import { uploadImage } from '@/lib/upload-file';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';

const HALAL_STATUS_LABELS: Record<string, string> = {
  belum_halal: 'Belum Halal',
  proses: 'Proses Sertifikasi',
  halal: 'Halal',
};

const VERIFICATION_STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu Verifikasi',
  terverifikasi: 'Terverifikasi',
  ditolak: 'Ditolak',
};

interface BusinessCategory {
  id: string;
  name: string;
}

interface UmkmDetail {
  id: string;
  ownerName: string;
  ownerNik: string | null;
  birthDate: string | null;
  ownerPhone: string;
  ownerKecamatan: string;
  ownerKabupaten: string;
  ownerAddress: string;
  ktpUrl: string | null;

  businessName: string;
  logoUrl: string | null;
  nibNumber: string;
  nibUrl: string | null;
  establishedYear: number;
  businessKecamatan: string;
  businessKabupaten: string;
  businessAddress: string;
  businessType: string;
  businessCategoryId: string;
  annualRevenue: string;
  businessContactNumber: string | null;

  createdAt: string;
  user: { email: string };
  businessCategory: { name: string };
  products: {
    id: string;
    name: string;
    halalStatus: string;
    verificationStatus: string;
    isPublished: boolean;
  }[];
}

function formatBusinessName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\bpt\b/gi, 'PT')
    .replace(/\bcv\b/gi, 'CV')
    .replace(/\bud\b/gi, 'UD')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

function formatCurrencyDisplay(val?: string | number | null) {
  if (!val) return '-';
  const numeric = String(val).replace(/\D/g, '');
  if (!numeric) return '-';
  return `Rp ${new Intl.NumberFormat('id-ID').format(Number(numeric))}`;
}

function formatNumberInput(val: string) {
  const numeric = val.replace(/\D/g, '');
  if (!numeric) return '';
  return new Intl.NumberFormat('id-ID').format(Number(numeric));
}

type FieldName = keyof typeof updateUmkmProfileSchema.shape;

function validateField(name: FieldName, value: unknown) {
  const schema = updateUmkmProfileSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

async function fetchDetail(id: string): Promise<UmkmDetail> {
  const res = await fetch(`/api/admin/umkm/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Data tidak ditemukan');
  return data.data;
}

async function fetchBusinessCategories(): Promise<BusinessCategory[]> {
  const res = await fetch('/api/public/business-categories');
  const data = await res.json();
  return data.data || [];
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function DocumentLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
        <FileText className="size-4" />
        {label}: tidak diunggah
      </div>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-md border p-3 text-sm text-primary hover:underline">
      <FileText className="size-4" />
      {label}
      <ExternalLink className="ml-auto size-3.5" />
    </a>
  );
}

export default function AdminUmkmDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: umkm, isLoading } = useQuery({
    queryKey: ['admin', 'umkm', params.id],
    queryFn: () => fetchDetail(params.id),
    staleTime: 30 * 1000,
  });

  // queryKey SAMA dengan yang dipakai di halaman profil UMKM - cache
  // ke-share lintas role kalau masih fresh
  const { data: categoryList = [] } = useQuery({
    queryKey: ['public', 'business-categories'],
    queryFn: fetchBusinessCategories,
    staleTime: 5 * 60 * 1000,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/umkm/${params.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Gagal menghapus UMKM');
        return;
      }

      toast.success('UMKM berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin', 'umkm'] });
      router.push('/admin/umkm');
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!umkm) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" className="w-fit gap-2 px-0 text-muted-foreground hover:bg-transparent hover:text-foreground" onClick={() => router.push('/admin/umkm')}>
          <ArrowLeft className="size-4" />
          Kembali ke daftar UMKM
        </Button>

        {!isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="size-4" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => setDeleteOpen(true)} className="border-destructive text-destructive hover:bg-destructive/10">
              <Trash2 className="size-4" />
              Hapus
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <EditForm umkm={umkm} categoryList={categoryList} onCancel={() => setIsEditing(false)} onSaved={() => setIsEditing(false)} />
      ) : (
        <>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{formatBusinessName(umkm.businessName)}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{formatBusinessName(umkm.businessCategory.name)}</Badge>
              <Badge variant="outline">{umkm.products.length} Produk</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <h3 className="text-sm font-semibold text-foreground">A. Data Pelaku Usaha</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <DetailRow label="Nama Pelaku Usaha" value={toTitleCase(umkm.ownerName)} />
                <DetailRow label="NIK" value={umkm.ownerNik ?? '-'} />
                <DetailRow label="Tanggal Lahir" value={umkm.birthDate ? formatDate(umkm.birthDate) : '-'} />
                <DetailRow label="Nomor WhatsApp" value={umkm.ownerPhone} />
                <DetailRow label="Email" value={umkm.user.email} />
                <DetailRow label="Kecamatan" value={toTitleCase(umkm.ownerKecamatan)} />
                <DetailRow label="Kabupaten/Kota" value={toTitleCase(umkm.ownerKabupaten)} />
              </div>
              <DetailRow label="Alamat" value={toTitleCase(umkm.ownerAddress)} />
              <DocumentLink label="KTP" url={umkm.ktpUrl} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <h3 className="text-sm font-semibold text-foreground">B. Data Usaha</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <DetailRow label="Nomor NIB" value={umkm.nibNumber} />
                <DetailRow label="Bentuk Usaha" value={BUSINESS_TYPE_LABELS[umkm.businessType] ?? umkm.businessType} />
                <DetailRow label="Tahun Berdiri" value={String(umkm.establishedYear)} />
                <DetailRow label="Kecamatan" value={toTitleCase(umkm.businessKecamatan)} />
                <DetailRow label="Kabupaten/Kota" value={toTitleCase(umkm.businessKabupaten)} />
                <DetailRow label="Nilai Omset/Tahun" value={formatCurrencyDisplay(umkm.annualRevenue)} />
                <DetailRow label="Kontak Usaha (Publik)" value={umkm.businessContactNumber ?? '-'} />
                <DetailRow label="Terdaftar Sejak" value={formatDate(umkm.createdAt)} />
              </div>
              <DetailRow label="Alamat" value={toTitleCase(umkm.businessAddress)} />
              <DocumentLink label="NIB" url={umkm.nibUrl} />
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-foreground">Daftar Produk ({umkm.products.length})</h3>
            {umkm.products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada produk.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {umkm.products.map((product) => (
                  <Link key={product.id} href={`/admin/products/${product.id}`} className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted">
                    <span className="font-medium">{formatBusinessName(product.name)}</span>
                    <div className="flex gap-1.5">
                      <Badge variant={product.halalStatus === 'halal' ? 'default' : 'secondary'} className="text-[10px]">
                        {HALAL_STATUS_LABELS[product.halalStatus] ?? product.halalStatus}
                      </Badge>
                      <Badge variant={product.verificationStatus === 'terverifikasi' ? 'default' : product.verificationStatus === 'ditolak' ? 'destructive' : 'secondary'} className="text-[10px]">
                        {VERIFICATION_STATUS_LABELS[product.verificationStatus] ?? product.verificationStatus}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus UMKM ini?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <strong>{formatBusinessName(umkm.businessName)}</strong> beserta <strong>{umkm.products.length} produk</strong>, semua riwayat pengajuan Daftar Mandiri/Sertifikasi Gratis, dan akun login mereka akan dihapus permanen.
              Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-white hover:bg-destructive/90">
              {isDeleting ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface EditFormProps {
  umkm: UmkmDetail;
  categoryList: BusinessCategory[];
  onCancel: () => void;
  onSaved: () => void;
}

function EditForm({ umkm, categoryList, onCancel, onSaved }: EditFormProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      ownerName: toTitleCase(umkm.ownerName),
      ownerNik: umkm.ownerNik ?? '',
      birthDate: umkm.birthDate ? umkm.birthDate.slice(0, 10) : '',
      ownerPhone: umkm.ownerPhone,
      ownerKecamatan: umkm.ownerKecamatan,
      ownerKabupaten: umkm.ownerKabupaten,
      ownerAddress: umkm.ownerAddress,
      ktpUrl: (umkm.ktpUrl ?? null) as DeferredImageValue,

      businessName: formatBusinessName(umkm.businessName),
      logoUrl: (umkm.logoUrl ?? null) as DeferredImageValue,
      nibNumber: umkm.nibNumber,
      nibUrl: (umkm.nibUrl ?? null) as DeferredImageValue,
      establishedYear: umkm.establishedYear,
      businessKecamatan: umkm.businessKecamatan,
      businessKabupaten: umkm.businessKabupaten,
      businessAddress: umkm.businessAddress,
      businessType: umkm.businessType as (typeof BUSINESS_TYPES)[number] | '',
      businessCategoryId: umkm.businessCategoryId,
      annualRevenue: formatNumberInput(umkm.annualRevenue ?? ''),
      businessContactNumber: umkm.businessContactNumber ?? '',
    },
    onSubmit: async ({ value }) => {
      if (isSaving) return;

      setIsSaving(true);
      try {
        const resolve = (val: DeferredImageValue, folder: string) => (val instanceof File ? uploadImage(val, folder) : Promise.resolve(val));

        const [ktpUrl, logoUrl, nibUrl] = await Promise.all([resolve(value.ktpUrl, 'umkm-documents'), resolve(value.logoUrl, 'umkm-logos'), resolve(value.nibUrl, 'umkm-documents')]);

        const rawRevenue = value.annualRevenue.replace(/\D/g, '');

        const payload = {
          ...value,
          ownerName: toTitleCase(value.ownerName),
          businessName: formatBusinessName(value.businessName),
          annualRevenue: rawRevenue,
          ktpUrl: ktpUrl ?? '',
          logoUrl: logoUrl ?? '',
          nibUrl: nibUrl ?? '',
        };

        const parsed = updateUmkmProfileSchema.safeParse(payload);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsSaving(false);
          return;
        }

        const res = await fetch(`/api/admin/umkm/${umkm.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success('Data UMKM berhasil diperbarui');
        queryClient.invalidateQueries({ queryKey: ['admin', 'umkm', umkm.id] });
        queryClient.invalidateQueries({ queryKey: ['admin', 'umkm'] });
        onSaved();
      } catch {
        toast.error('Gagal mengunggah berkas, silakan coba lagi');
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Edit Data UMKM</h2>
        <Button type="button" variant="ghost" size="icon-sm" onClick={onCancel}>
          <X className="size-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold">A. Data Pelaku Usaha</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="ownerName" validators={{ onChange: ({ value }) => validateField('ownerName', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nama Pelaku Usaha</Label>
                  <Input disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="ownerNik" validators={{ onChange: ({ value }) => validateField('ownerNik', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>NIK</Label>
                  <Input inputMode="numeric" maxLength={16} disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="birthDate" validators={{ onChange: ({ value }) => validateField('birthDate', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Tanggal Lahir</Label>
                  <Input type="date" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="ownerPhone" validators={{ onChange: ({ value }) => validateField('ownerPhone', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nomor WhatsApp</Label>
                  <Input inputMode="numeric" maxLength={13} disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="ownerKabupaten" validators={{ onChange: ({ value }) => validateField('ownerKabupaten', value) }}>
              {(kabupatenField) => (
                <form.Field name="ownerKecamatan" validators={{ onChange: ({ value }) => validateField('ownerKecamatan', value) }}>
                  {(kecamatanField) => (
                    <KabupatenKecamatanField
                      kabupatenValue={kabupatenField.state.value}
                      kecamatanValue={kecamatanField.state.value}
                      onKabupatenChange={(v) => kabupatenField.handleChange(v)}
                      onKecamatanChange={(v) => kecamatanField.handleChange(v)}
                      disabled={isSaving}
                      kabupatenError={kabupatenField.state.meta.errors[0]}
                      kecamatanError={kecamatanField.state.meta.errors[0]}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>

            <div className="md:col-span-2">
              <form.Field name="ownerAddress" validators={{ onChange: ({ value }) => validateField('ownerAddress', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Detail Alamat</Label>
                    <Textarea rows={2} disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>
            </div>

            <div className="md:col-span-2">
              <form.Field name="ktpUrl">{(field) => <DeferredImageField label="KTP" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isSaving} />}</form.Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <h3 className="text-sm font-semibold">B. Data Usaha</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="businessName" validators={{ onChange: ({ value }) => validateField('businessName', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nama Usaha/Merk</Label>
                  <Input disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="logoUrl">{(field) => <DeferredImageField label="Logo Usaha (opsional)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isSaving} />}</form.Field>

            <form.Field name="nibNumber" validators={{ onChange: ({ value }) => validateField('nibNumber', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nomor NIB</Label>
                  <Input inputMode="numeric" maxLength={13} disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="nibUrl">{(field) => <DeferredImageField label="Upload NIB" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isSaving} />}</form.Field>

            <form.Field name="establishedYear" validators={{ onChange: ({ value }) => validateField('establishedYear', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Tahun Berdiri</Label>
                  <Input type="number" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(Number(e.target.value))} />
                </div>
              )}
            </form.Field>

            <form.Field name="businessType" validators={{ onChange: ({ value }) => validateField('businessType', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Bentuk Usaha</Label>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange((v ?? '') as any)} disabled={isSaving}>
                    <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{BUSINESS_TYPE_LABELS[field.state.value]}</SelectValue> : <SelectValue placeholder="Pilih" />}</SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {BUSINESS_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="businessKabupaten" validators={{ onChange: ({ value }) => validateField('businessKabupaten', value) }}>
              {(kabupatenField) => (
                <form.Field name="businessKecamatan" validators={{ onChange: ({ value }) => validateField('businessKecamatan', value) }}>
                  {(kecamatanField) => (
                    <KabupatenKecamatanField
                      kabupatenValue={kabupatenField.state.value}
                      kecamatanValue={kecamatanField.state.value}
                      onKabupatenChange={(v) => kabupatenField.handleChange(v)}
                      onKecamatanChange={(v) => kecamatanField.handleChange(v)}
                      disabled={isSaving}
                      kabupatenError={kabupatenField.state.meta.errors[0]}
                      kecamatanError={kecamatanField.state.meta.errors[0]}
                    />
                  )}
                </form.Field>
              )}
            </form.Field>

            <div className="md:col-span-2">
              <form.Field name="businessAddress" validators={{ onChange: ({ value }) => validateField('businessAddress', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Detail Alamat</Label>
                    <Textarea rows={2} disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="businessCategoryId" validators={{ onChange: ({ value }) => validateField('businessCategoryId', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Jenis/Sektor/Kategori Usaha</Label>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v ?? '')} disabled={isSaving}>
                    <SelectTrigger className="w-full">
                      {field.state.value ? <SelectValue>{formatBusinessName(categoryList.find((c) => c.id === field.state.value)?.name ?? '')}</SelectValue> : <SelectValue placeholder="Pilih kategori usaha" />}
                    </SelectTrigger>
                    <SelectContent>
                      {categoryList.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {formatBusinessName(cat.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="annualRevenue" validators={{ onChange: ({ value }) => validateField('annualRevenue', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nilai Omset Per Tahun</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 select-none text-sm text-muted-foreground">Rp</span>
                    <Input disabled={isSaving} className="pl-9" inputMode="numeric" placeholder="0" value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(formatNumberInput(e.target.value))} />
                  </div>
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>

            <form.Field name="businessContactNumber" validators={{ onChange: ({ value }) => validateField('businessContactNumber', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label>Nomor Kontak Usaha (Publik)</Label>
                  <Input inputMode="numeric" maxLength={13} placeholder="08xxxxxxxxxx" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isSaving} className="w-fit">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          )}
        </form.Subscribe>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
          Batal
        </Button>
      </div>
    </form>
  );
}
