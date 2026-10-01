// components/umkm/register/business-section.tsx

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeferredFileField } from '@/components/deferred-file-field';
import { KabupatenKecamatanField } from '@/components/shared/kabupaten-kecamatan-field';
import { Field } from '@/components/umkm/register/field';
import { registerFormObjectSchema } from '@/schemas/register-form.schema';
import { BUSINESS_TYPES } from '@/schemas/register.schema';
import { BUSINESS_TYPE_LABELS, type RegisterFormApi } from '@/components/umkm/register/register-shared';
import { toTitleCase } from '@/lib/title-case';

interface BusinessCategory {
  id: string;
  name: string;
}

interface BusinessSectionProps {
  form: RegisterFormApi;
  isLoading: boolean;
  categoryList: BusinessCategory[];
}

function validateField(name: keyof typeof registerFormObjectSchema.shape, value: unknown) {
  const schema = registerFormObjectSchema.shape[name] as { safeParse: (v: unknown) => any };
  const result = schema.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

function validateFileField(value: File | null, label: string) {
  return value ? undefined : `${label} wajib diunggah`;
}

function formatRupiahDisplay(digits: string) {
  if (!digits) return '';
  return `Rp ${Number(digits).toLocaleString('id-ID')}`;
}

export function BusinessSection({ form, isLoading, categoryList }: BusinessSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">B. Data Usaha</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <form.Field name="businessName" validators={{ onChange: ({ value }) => validateField('businessName', value) }}>
          {(field) => (
            <Field label="Nama Usaha/Merk" error={field.state.meta.errors[0]}>
              <Input
                placeholder="Nama merk / brand usaha"
                disabled={isLoading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="logoFile">
          {(field) => (
            <DeferredFileField
              label="Logo Usaha (opsional)"
              description="Format: Gambar (JPG, PNG, WEBP), maksimal 3 MB."
              value={field.state.value}
              onChange={field.handleChange}
              disabled={isLoading}
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={3}
            />
          )}
        </form.Field>

        <form.Field name="nibNumber" validators={{ onChange: ({ value }) => validateField('nibNumber', value) }}>
          {(field) => (
            <Field label="Nomor NIB" error={field.state.meta.errors[0]}>
              <Input
                inputMode="numeric"
                maxLength={13}
                placeholder="13 digit angka NIB"
                disabled={isLoading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Belum punya NIB? Daftar dulu di{' '}
                <a href="https://oss.go.id/id" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline">
                  oss.go.id
                </a>
                .
              </p>
            </Field>
          )}
        </form.Field>

        <form.Field name="nibFile">
          {(field) => (
            <div className="flex flex-col gap-1">
              <DeferredFileField
                label="Upload NIB"
                description="Format: Dokumen PDF resmi dari OSS, maksimal 3 MB."
                value={field.state.value}
                onChange={field.handleChange}
                disabled={isLoading}
                accept="application/pdf"
                maxSizeMB={3}
                error={form.state.isSubmitted ? validateFileField(field.state.value, 'NIB') : undefined}
              />
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
            <Field label="Tahun Berdiri" error={field.state.meta.errors[0]}>
              <Input
                type="number"
                placeholder="Tahun berdiri (misal: 2022)"
                disabled={isLoading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="businessType" validators={{ onChange: ({ value }) => validateField('businessType', value) }}>
          {(field) => (
            <Field label="Bentuk Usaha" error={field.state.meta.errors[0]}>
              <Select value={field.state.value} onValueChange={(v) => field.handleChange((v ?? '') as any)} disabled={isLoading}>
                <SelectTrigger className="w-full">{field.state.value ? <SelectValue>{BUSINESS_TYPE_LABELS[field.state.value]}</SelectValue> : <SelectValue placeholder="Pilih bentuk usaha" />}</SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {BUSINESS_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
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
                  disabled={isLoading}
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
              <Field label="Detail Alamat" error={field.state.meta.errors[0]}>
                <Textarea
                  rows={2}
                  placeholder="Alamat tempat produksi / outlet usaha"
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

        <form.Field name="businessCategoryId" validators={{ onChange: ({ value }) => validateField('businessCategoryId', value) }}>
          {(field) => (
            <Field label="Jenis/Sektor/Kategori Usaha" error={field.state.meta.errors[0]}>
              <Select
                value={field.state.value}
                onValueChange={(v) => {
                  const val = v ?? '';
                  field.handleChange(val);
                  if (val !== 'lainnya') {
                    form.setFieldValue('customBusinessCategory', '');
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  {field.state.value === 'lainnya' ? (
                    <SelectValue>Lainnya</SelectValue>
                  ) : field.state.value ? (
                    <SelectValue>{toTitleCase(categoryList.find((c) => c.id === field.state.value)?.name ?? '')}</SelectValue>
                  ) : (
                    <SelectValue placeholder="Pilih kategori usaha" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {categoryList.length === 0 ? (
                    <p className="px-2 py-3 text-center text-sm text-muted-foreground">Belum ada data di sini</p>
                  ) : (
                    categoryList.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {toTitleCase(cat.name)}
                      </SelectItem>
                    ))
                  )}
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.values.businessCategoryId}>
          {(businessCategoryId) =>
            businessCategoryId === 'lainnya' && (
              <form.Field name="customBusinessCategory" validators={{ onChange: ({ value }) => validateField('customBusinessCategory', value) }}>
                {(field) => (
                  <Field label="Nama Kategori Usaha Anda" error={field.state.meta.errors[0]}>
                    <Input
                      placeholder="Tuliskan kategori usaha"
                      disabled={isLoading}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="placeholder:text-xs sm:placeholder:text-sm"
                    />
                  </Field>
                )}
              </form.Field>
            )
          }
        </form.Subscribe>

        <form.Field name="annualRevenue" validators={{ onChange: ({ value }) => validateField('annualRevenue', value) }}>
          {(field) => (
            <Field label="Nilai Omset Per Tahun" error={field.state.meta.errors[0]}>
              <Input
                inputMode="numeric"
                placeholder="Rp 0"
                disabled={isLoading}
                value={formatRupiahDisplay(field.state.value)}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value.replace(/\D/g, ''))}
                className="placeholder:text-xs sm:placeholder:text-sm"
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="businessContactNumber" validators={{ onChange: ({ value }) => validateField('businessContactNumber', value) }}>
          {(field) => (
            <Field label="Nomor Kontak Usaha (Publik)" error={field.state.meta.errors[0]}>
              <Input placeholder="08xxxxxxxxxx" disabled={isLoading} value={field.state.value} onBlur={field.handleBlur} onChange={(e) => field.handleChange(e.target.value)} className="placeholder:text-xs sm:placeholder:text-sm" />
              <p className="text-xs text-muted-foreground">Nomor ini akan ditampilkan di profil UMKM agar pelanggan dapat menghubungi usaha Anda.</p>
            </Field>
          )}
        </form.Field>
      </div>
    </section>
  );
}
