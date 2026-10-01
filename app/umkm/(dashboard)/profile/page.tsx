// app/umkm/(dashboard)/profile/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { updateUmkmProfileSchema } from '@/schemas/umkm-profile.schema';
import { BUSINESS_TYPES } from '@/schemas/register.schema';
import { KabupatenKecamatanField } from '@/components/shared/kabupaten-kecamatan-field';
import { BUSINESS_TYPE_LABELS } from '@/components/umkm/register/register-shared';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';
import { DeferredFileField } from '@/components/deferred-file-field';
import { uploadImage, uploadDocument, formatErrorMessage } from '@/lib/upload-file';
import { toTitleCase } from '@/lib/title-case';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BusinessCategory {
  id: string;
  name: string;
}

interface UmkmProfileData {
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
}

function formatBusinessName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

type FieldName = keyof typeof updateUmkmProfileSchema.shape;

function validateField(name: FieldName, value: unknown) {
  const schema = updateUmkmProfileSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

function formatRupiahDisplay(digits: string) {
  if (!digits) return '';
  return `Rp ${Number(digits).toLocaleString('id-ID')}`;
}

async function fetchProfile(): Promise<UmkmProfileData> {
  const res = await fetch('/api/umkm/profile');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Gagal memuat data profil');
  return data.data;
}

async function fetchBusinessCategories(): Promise<BusinessCategory[]> {
  const res = await fetch('/api/public/business-categories');
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || 'Gagal memuat kategori usaha');
  return data.data || [];
}

export default function UmkmProfilePage() {
  const {
    data: profile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['umkm', 'profile'],
    queryFn: fetchProfile,
    staleTime: 60 * 1000,
  });

  // kategori usaha publik, jarang berubah - staleTime panjang biar gak
  // fetch ulang tiap kali halaman ini di-mount
  const { data: categoryList = [] } = useQuery({
    queryKey: ['public', 'business-categories'],
    queryFn: fetchBusinessCategories,
    staleTime: 5 * 60 * 1000,
  });

  if (isProfileLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (profileError || !profile) {
    return <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive">{formatErrorMessage(profileError, 'Gagal memuat profil UMKM. Silakan muat ulang halaman.')}</div>;
  }

  return <ProfileForm profile={profile} categoryList={categoryList} />;
}

interface ProfileFormProps {
  profile: UmkmProfileData;
  categoryList: BusinessCategory[];
}

function ProfileForm({ profile, categoryList }: ProfileFormProps) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      ownerName: toTitleCase(profile.ownerName),
      ownerNik: profile.ownerNik ?? '',
      birthDate: profile.birthDate ? profile.birthDate.slice(0, 10) : '',
      ownerPhone: profile.ownerPhone,
      ownerKecamatan: profile.ownerKecamatan,
      ownerKabupaten: profile.ownerKabupaten,
      ownerAddress: profile.ownerAddress,
      ktpUrl: (profile.ktpUrl ?? null) as DeferredImageValue,

      businessName: formatBusinessName(profile.businessName),
      logoUrl: (profile.logoUrl ?? null) as DeferredImageValue,
      nibNumber: profile.nibNumber,
      nibFile: null as File | null,
      nibUrl: profile.nibUrl ?? '',
      establishedYear: profile.establishedYear,
      businessKecamatan: profile.businessKecamatan,
      businessKabupaten: profile.businessKabupaten,
      businessAddress: profile.businessAddress,
      businessType: profile.businessType as (typeof BUSINESS_TYPES)[number] | '',
      businessCategoryId: profile.businessCategoryId,
      annualRevenue: profile.annualRevenue,
      businessContactNumber: profile.businessContactNumber ?? '',
    },
    onSubmit: async ({ value }) => {
      if (isSaving) return;

      setIsSaving(true);
      try {
        let ktpUrl = value.ktpUrl as string;
        if (value.ktpUrl instanceof File) {
          ktpUrl = await uploadImage(value.ktpUrl, 'umkm-documents');
        }

        let logoUrl = value.logoUrl as string;
        if (value.logoUrl instanceof File) {
          logoUrl = await uploadImage(value.logoUrl, 'umkm-logos');
        }

        let nibUrl = value.nibUrl;
        if (value.nibFile instanceof File) {
          nibUrl = await uploadDocument(value.nibFile, 'umkm-documents');
        }

        const { nibFile, ...restValues } = value;

        const payload = {
          ...restValues,
          ownerName: toTitleCase(value.ownerName),
          businessName: formatBusinessName(value.businessName),
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

        const res = await fetch('/api/umkm/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(data?.error || 'Gagal memperbarui profil');
          return;
        }

        toast.success('Profil berhasil diperbarui');
        queryClient.invalidateQueries({ queryKey: ['umkm', 'profile'] });
      } catch (error) {
        console.error('Profile update error:', error);
        toast.error(formatErrorMessage(error, 'Gagal menyimpan perubahan profil, periksa koneksi internet Anda'));
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profil Usaha</h1>
        <p className="text-sm text-muted-foreground">Kelola data pelaku usaha dan data usaha anda.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-6"
      >
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <h3 className="text-sm font-semibold">A. Data Pelaku Usaha</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field name="ownerName" validators={{ onChange: ({ value }) => validateField('ownerName', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nama Pelaku Usaha</Label>
                    <Input placeholder="Budi Santoso" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} className="placeholder:text-xs sm:placeholder:text-sm" />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="ownerNik" validators={{ onChange: ({ value }) => validateField('ownerNik', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>NIK</Label>
                    <Input
                      inputMode="numeric"
                      maxLength={16}
                      placeholder="16 digit sesuai KTP"
                      disabled={isSaving}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                      className="placeholder:text-xs sm:placeholder:text-sm"
                    />
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
                    <Input placeholder="08xxxxxxxxxx" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} className="placeholder:text-xs sm:placeholder:text-sm" />
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
                      <Textarea
                        rows={2}
                        placeholder="Nama jalan, nomor rumah, RT/RW, atau patokan"
                        disabled={isSaving}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="placeholder:text-xs sm:placeholder:text-sm"
                      />
                      {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="md:col-span-2">
                <form.Field name="ktpUrl">{(field) => <DeferredImageField label="KTP (Format: Gambar)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isSaving} />}</form.Field>
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
                    <Input
                      placeholder="Nama merk / brand usaha"
                      disabled={isSaving}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="placeholder:text-xs sm:placeholder:text-sm"
                    />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="logoUrl">{(field) => <DeferredImageField label="Logo Usaha (Format: Gambar, opsional)" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isSaving} />}</form.Field>

              <form.Field name="nibNumber" validators={{ onChange: ({ value }) => validateField('nibNumber', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nomor NIB</Label>
                    <Input
                      inputMode="numeric"
                      maxLength={13}
                      placeholder="13 digit angka NIB"
                      disabled={isSaving}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                      className="placeholder:text-xs sm:placeholder:text-sm"
                    />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="nibFile">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <DeferredFileField label="Upload NIB" description="Format: Dokumen PDF resmi dari OSS, maksimal 3 MB." value={field.state.value} onChange={field.handleChange} disabled={isSaving} accept="application/pdf" maxSizeMB={3} />
                    {profile.nibUrl && !field.state.value && (
                      <p className="text-xs text-muted-foreground">
                        File tersimpan:{' '}
                        <a href={profile.nibUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                          Lihat Dokumen NIB Saat Ini
                        </a>
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Ukuran file terlalu besar? Kompres terlebih dahulu di{' '}
                      <a href="https://www.ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                        ilovepdf.com/compress_pdf
                      </a>
                      .
                    </p>
                  </div>
                )}
              </form.Field>

              <form.Field name="establishedYear" validators={{ onChange: ({ value }) => validateField('establishedYear', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Tahun Berdiri</Label>
                    <Input
                      type="number"
                      placeholder="Tahun berdiri (misal: 2022)"
                      disabled={isSaving}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="placeholder:text-xs sm:placeholder:text-sm"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="businessType" validators={{ onChange: ({ value }) => validateField('businessType', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Bentuk Usaha</Label>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange((v ?? '') as any)} disabled={isSaving}>
                      <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{BUSINESS_TYPE_LABELS[field.state.value]}</SelectValue> : <SelectValue placeholder="Pilih bentuk usaha" />}</SelectTrigger>
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
                      <Textarea
                        rows={2}
                        placeholder="Alamat tempat produksi / outlet usaha"
                        disabled={isSaving}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="placeholder:text-xs sm:placeholder:text-sm"
                      />
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
                        {field.state.value ? <SelectValue>{toTitleCase(categoryList.find((c) => c.id === field.state.value)?.name ?? '')}</SelectValue> : <SelectValue placeholder="Pilih kategori usaha" />}
                      </SelectTrigger>
                      <SelectContent>
                        {categoryList.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {toTitleCase(cat.name)}
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
                    <Input
                      inputMode="numeric"
                      placeholder="Rp 0"
                      disabled={isSaving}
                      value={formatRupiahDisplay(field.state.value)}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                      className="placeholder:text-xs sm:placeholder:text-sm"
                    />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="businessContactNumber" validators={{ onChange: ({ value }) => validateField('businessContactNumber', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nomor Kontak Usaha (Publik)</Label>
                    <Input placeholder="08xxxxxxxxxx" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} className="placeholder:text-xs sm:placeholder:text-sm" />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>
            </div>
          </CardContent>
        </Card>

        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button type="submit" disabled={!canSubmit || isSaving} className="w-fit">
              {isSaving ? 'Mengunggah & menyimpan...' : 'Simpan Perubahan'}
            </Button>
          )}
        </form.Subscribe>
      </form>
    </div>
  );
}
