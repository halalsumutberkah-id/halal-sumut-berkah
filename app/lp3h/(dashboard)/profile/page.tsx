// app/lp3h/(dashboard)/profile/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { UserRound } from 'lucide-react';
import { updateLp3hProfileSchema } from '@/schemas/lp3h-profile.schema';
import { KabupatenKecamatanField } from '@/components/shared/kabupaten-kecamatan-field';
import { DeferredImageField, type DeferredImageValue } from '@/components/shared/deferred-image-field';
import { uploadImage } from '@/lib/upload-file';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toTitleCase } from '@/lib/title-case';

interface Lp3hProfileData {
  name: string;
  jenisLembaga: string | null;
  lembagaInduk: string | null;
  officeKecamatan: string | null;
  officeKabupaten: string | null;
  officeAddress: string | null;
  phone: string;
  contactEmail: string | null;
  logoUrl: string | null;
  bio: string | null;
  pjName: string | null;
  pjNik: string | null;
  pjEmail: string | null;
  pjJabatan: string | null;
  pjJenisKelamin: string | null;
  pjPhone: string | null;
  pjKtpUrl: string | null;
  registrationDocumentUrl: string | null;
}

function formatLp3hName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\blp3h\b/gi, 'LP3H').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

// KTP penanggung jawab: batas ukuran 1 MB (bisa disesuaikan) - divalidasi
// manual di sini karena DeferredImageField tidak punya validasi ukuran
// bawaan
const PJ_KTP_MAX_SIZE_MB = 1;

// standarisasi nama berkas KTP penanggung jawab: <slug-nama>_KTP-LP3H.<ext>
// - upload-file.ts selalu convert gambar ke .webp lewat compressImage(),
// jadi ekstensi akhir yang tersimpan pasti .webp meskipun file asli
// jpg/png. Bagian nama (sebelum ekstensi) tetap mengikuti pola ini.
function buildPjKtpFileName(pjName: string, originalFile: File) {
  const slug =
    pjName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'penanggung-jawab';
  const ext = originalFile.name.split('.').pop() || 'jpg';
  return `${slug}_KTP-LP3H.${ext}`;
}

type FieldName = keyof typeof updateLp3hProfileSchema.shape;

function validateField(name: FieldName, value: unknown) {
  const schema = updateLp3hProfileSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

async function fetchProfile(): Promise<Lp3hProfileData> {
  const res = await fetch('/api/lp3h/profile');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Gagal memuat profil');
  return data.data;
}

export default function Lp3hProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['lp3h', 'profile'],
    queryFn: fetchProfile,

    staleTime: 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="flex flex-col gap-6">
      <ProfileForm profile={profile} />
    </div>
  );
}

function ProfileForm({ profile }: { profile: Lp3hProfileData }) {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    defaultValues: {
      name: formatLp3hName(profile.name),
      jenisLembaga: profile.jenisLembaga ?? '',
      lembagaInduk: profile.lembagaInduk ?? '',
      officeKecamatan: profile.officeKecamatan ?? '',
      officeKabupaten: profile.officeKabupaten ?? '',
      officeAddress: profile.officeAddress ?? '',
      phone: profile.phone,
      contactEmail: profile.contactEmail ?? '',
      logoUrl: (profile.logoUrl ?? null) as DeferredImageValue,
      bio: profile.bio ?? '',
      pjName: profile.pjName ? toTitleCase(profile.pjName) : '',
      pjNik: profile.pjNik ?? '',
      pjEmail: profile.pjEmail ?? '',
      pjJabatan: profile.pjJabatan ?? '',
      pjJenisKelamin: (profile.pjJenisKelamin as 'L' | 'P' | '') ?? '',
      pjPhone: profile.pjPhone ?? '',
      pjKtpUrl: (profile.pjKtpUrl ?? null) as DeferredImageValue,
      registrationDocumentUrl: (profile.registrationDocumentUrl ?? null) as DeferredImageValue,
    },
    onSubmit: async ({ value }) => {
      if (isSaving) return;

      setIsSaving(true);
      try {
        const resolveImage = (val: DeferredImageValue, folder: string) => (val instanceof File ? uploadImage(val, folder) : Promise.resolve(val));

        // rename file KTP PJ sebelum upload biar nama berkasnya mengikuti
        // konvensi <slug-nama>_KTP-LP3H.<ext> (ekstensi akhir tetap
        // ditentukan pipeline compressImage, biasanya .webp)
        const pjKtpFile = value.pjKtpUrl instanceof File ? new File([value.pjKtpUrl], buildPjKtpFileName(value.pjName, value.pjKtpUrl), { type: value.pjKtpUrl.type }) : value.pjKtpUrl;

        const [logoUrl, pjKtpUrl, registrationDocumentUrl] = await Promise.all([resolveImage(value.logoUrl, 'lp3h-avatars'), resolveImage(pjKtpFile, 'lp3h-pj-documents'), resolveImage(value.registrationDocumentUrl, 'lp3h-documents')]);

        const payload = {
          ...value,
          name: formatLp3hName(value.name),
          pjName: toTitleCase(value.pjName),
          logoUrl: logoUrl ?? '',
          pjKtpUrl: pjKtpUrl ?? '',
          registrationDocumentUrl: registrationDocumentUrl ?? '',
        };

        const parsed = updateLp3hProfileSchema.safeParse(payload);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsSaving(false);
          return;
        }

        const res = await fetch('/api/lp3h/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success('Profil berhasil diperbarui');
        queryClient.invalidateQueries({ queryKey: ['lp3h', 'profile'] });
      } catch {
        toast.error('Gagal mengunggah gambar, silakan coba lagi');
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profil Lembaga</h1>
        <p className="text-sm text-muted-foreground">Lengkapi profil LP3H anda. Data ini akan tampil di direktori publik.</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field name="name" validators={{ onChange: ({ value }) => validateField('name', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nama Lembaga</Label>
                    <Input disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="jenisLembaga" validators={{ onChange: ({ value }) => validateField('jenisLembaga', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Jenis Lembaga</Label>
                    <Input placeholder="Contoh: Yayasan, Perguruan Tinggi" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="lembagaInduk" validators={{ onChange: ({ value }) => validateField('lembagaInduk', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Lembaga Induk</Label>
                    <Input disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="phone" validators={{ onChange: ({ value }) => validateField('phone', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nomor Telepon</Label>
                    <Input inputMode="numeric" maxLength={13} placeholder="08xxxxxxxxxx" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="contactEmail" validators={{ onChange: ({ value }) => validateField('contactEmail', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Email Kontak (Publik)</Label>
                    <Input type="email" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="officeKabupaten" validators={{ onChange: ({ value }) => validateField('officeKabupaten', value) }}>
                {(kabupatenField) => (
                  <form.Field name="officeKecamatan" validators={{ onChange: ({ value }) => validateField('officeKecamatan', value) }}>
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
                <form.Field name="officeAddress" validators={{ onChange: ({ value }) => validateField('officeAddress', value) }}>
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label>Detail Alamat Kantor</Label>
                      <Textarea rows={2} disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                      {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="md:col-span-2">
                <form.Field name="logoUrl">{(field) => <DeferredImageField label="Avatar/Logo Lembaga" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isSaving} />}</form.Field>
              </div>

              <div className="md:col-span-2">
                <form.Field name="bio">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label>Bio (opsional)</Label>
                      <Textarea rows={4} placeholder="Ceritakan singkat tentang lembaga anda" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                      <p className="text-xs text-muted-foreground">Bio ini akan tampil secara publik sebagai penjelasan mengenai lembaga/yayasan Anda.</p>
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 pt-2">
          <UserRound className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Data Penanggung Jawab/Admin LP3H</h2>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field name="pjName" validators={{ onChange: ({ value }) => validateField('pjName', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nama Lengkap Admin</Label>
                    <Input disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="pjNik" validators={{ onChange: ({ value }) => validateField('pjNik', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>NIK Admin</Label>
                    <Input inputMode="numeric" maxLength={16} placeholder="16 digit angka" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="pjEmail" validators={{ onChange: ({ value }) => validateField('pjEmail', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Email Aktif</Label>
                    <Input type="email" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="pjJabatan" validators={{ onChange: ({ value }) => validateField('pjJabatan', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Jabatan Admin</Label>
                    <Input placeholder="Contoh: Ketua / Sekretaris / Admin Operasional" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="pjJenisKelamin">
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Jenis Kelamin</Label>
                    <Select value={field.state.value} onValueChange={(v) => field.handleChange((v as 'L' | 'P') ?? '')} disabled={isSaving}>
                      <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{field.state.value === 'L' ? 'Laki-laki' : 'Perempuan'}</SelectValue> : <SelectValue placeholder="Pilih" />}</SelectTrigger>
                      <SelectContent>
                        <SelectItem value="L">Laki-laki</SelectItem>
                        <SelectItem value="P">Perempuan</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <form.Field name="pjPhone" validators={{ onChange: ({ value }) => validateField('pjPhone', value) }}>
                {(field) => (
                  <div className="flex flex-col gap-1.5">
                    <Label>Nomor WhatsApp</Label>
                    <Input inputMode="numeric" maxLength={13} placeholder="08xxxxxxxxxx" disabled={isSaving} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))} />
                    {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                  </div>
                )}
              </form.Field>

              <div className="md:col-span-2">
                <form.Field name="pjKtpUrl" validators={{ onChange: ({ value }) => (value ? undefined : 'KTP penanggung jawab wajib diunggah') }}>
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <DeferredImageField
                        label="Upload KTP Penanggung Jawab"
                        value={field.state.value as DeferredImageValue}
                        onChange={(v) => {
                          if (v instanceof File && v.size > PJ_KTP_MAX_SIZE_MB * 1024 * 1024) {
                            toast.error(`Ukuran KTP maksimal ${PJ_KTP_MAX_SIZE_MB} MB`);
                            return;
                          }
                          field.handleChange(v);
                        }}
                        disabled={isSaving}
                      />
                      <p className="text-xs text-muted-foreground">Format gambar (JPG/PNG), maksimal {PJ_KTP_MAX_SIZE_MB} MB.</p>
                      {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-2 pt-2">
          <h2 className="text-sm font-semibold text-foreground">Legalitas Lembaga</h2>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <form.Field name="registrationDocumentUrl" validators={{ onChange: ({ value }) => validateField('registrationDocumentUrl', value) }}>
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <DeferredImageField label="Upload Bukti Screenshot Nomor Registrasi SIHALAL" value={field.state.value as DeferredImageValue} onChange={field.handleChange} disabled={isSaving} />
                  <p className="text-xs text-muted-foreground">Tangkapan layar halaman SIHALAL yang menampilkan nomor registrasi lembaga anda (format JPG/PNG/JPEG).</p>
                  {field.state.meta.errors[0] && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
                </div>
              )}
            </form.Field>
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
