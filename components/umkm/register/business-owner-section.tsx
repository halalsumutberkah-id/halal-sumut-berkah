// components/umkm/register/business-owner-section.tsx

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeferredFileField } from '@/components/deferred-file-field';
import { KabupatenKecamatanField } from '@/components/shared/kabupaten-kecamatan-field';
import { Field } from '@/components/umkm/register/field';
import { registerFormObjectSchema } from '@/schemas/register-form.schema';
import { type RegisterFormApi } from '@/components/umkm/register/register-shared';

const GENDER_LABELS: Record<'L' | 'P', string> = {
  L: 'Laki-laki',
  P: 'Perempuan',
};

interface BusinessOwnerSectionProps {
  form: RegisterFormApi;
  isLoading: boolean;
}

function validateField(name: keyof typeof registerFormObjectSchema.shape, value: unknown) {
  const schema = registerFormObjectSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

function validateFileField(value: File | null, label: string) {
  return value ? undefined : `${label} wajib diunggah`;
}

export function BusinessOwnerSection({ form, isLoading }: BusinessOwnerSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">A. Data Pelaku Usaha</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form.Field name="ownerName" validators={{ onChange: ({ value }) => validateField('ownerName', value) }}>
          {(field) => (
            <Field label="Nama Pelaku Usaha" error={field.state.meta.errors[0]}>
              <Input
                placeholder="Nama lengkap sesuai KTP"
                disabled={isLoading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="ownerNik" validators={{ onChange: ({ value }) => validateField('ownerNik', value) }}>
          {(field) => (
            <Field label="NIK" error={field.state.meta.errors[0]}>
              <Input
                inputMode="numeric"
                maxLength={16}
                placeholder="16 digit angka NIK"
                disabled={isLoading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="ownerGender" validators={{ onChange: ({ value }) => validateField('ownerGender', value) }}>
          {(field) => (
            <Field label="Jenis Kelamin" error={field.state.meta.errors[0]}>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange((v ?? '') as any)} disabled={isLoading}>
                <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{GENDER_LABELS[field.state.value as 'L' | 'P']}</SelectValue> : <SelectValue placeholder="Pilih jenis kelamin" />}</SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Field name="birthDate" validators={{ onChange: ({ value }) => validateField('birthDate', value) }}>
          {(field) => (
            <Field label="Tanggal Lahir" error={field.state.meta.errors[0]}>
              <Input type="date" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} className="placeholder:text-xs sm:placeholder:text-sm" />
            </Field>
          )}
        </form.Field>

        <form.Field name="ownerPhone" validators={{ onChange: ({ value }) => validateField('ownerPhone', value) }}>
          {(field) => (
            <Field label="Nomor WhatsApp" error={field.state.meta.errors[0]}>
              <Input placeholder="08xxxxxxxxxx" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} className="placeholder:text-xs sm:placeholder:text-sm" />
            </Field>
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
                  disabled={isLoading}
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
              <Field label="Detail Alamat" error={field.state.meta.errors[0]}>
                <Textarea
                  rows={2}
                  placeholder="Nama jalan, nomor rumah, RT/RW, atau patokan"
                  disabled={isLoading}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="placeholder:text-xs sm:placeholder:text-sm"
                />
              </Field>
            )}
          </form.Field>
        </div>

        <div className="md:col-span-2">
          <form.Field name="ktpFile">
            {(field) => (
              <DeferredFileField
                label="Upload KTP"
                description="Format: Gambar (JPG, PNG, WEBP), maksimal 3 MB."
                value={field.state.value}
                onChange={field.handleChange}
                disabled={isLoading}
                accept="image/jpeg,image/png,image/webp"
                maxSizeMB={3}
                error={form.state.isSubmitted ? validateFileField(field.state.value, 'KTP') : undefined}
              />
            )}
          </form.Field>
        </div>
      </div>
    </section>
  );
}
