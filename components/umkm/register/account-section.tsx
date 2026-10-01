'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/umkm/register/field';
import { registerFormObjectSchema } from '@/schemas/register-form.schema';
import type { RegisterFormApi } from '@/components/umkm/register/register-shared';

interface AccountSectionProps {
  form: RegisterFormApi;
  isLoading: boolean;
}

function validatePassword(value: unknown) {
  const result = registerFormObjectSchema.shape.password.safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

export function AccountSection({ form, isLoading }: AccountSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Akun</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                const result = registerFormObjectSchema.shape.email.safeParse(value);
                return result.success ? undefined : result.error.issues[0].message;
              },
            }}
          >
            {(field) => (
              <Field label="Email" error={field.state.meta.errors[0]}>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  disabled={isLoading}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="placeholder:text-xs sm:placeholder:text-sm"
                />
                <p className="text-xs text-muted-foreground">Gunakan email aktif - kode verifikasi (OTP) akan dikirim ke email ini.</p>
              </Field>
            )}
          </form.Field>
        </div>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => validatePassword(value),
            onBlur: ({ value }) => validatePassword(value),
          }}
        >
          {(field) => (
            <Field label="Password" error={field.state.meta.errors[0]}>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 karakter (huruf, angka, simbol)"
                  disabled={isLoading}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pr-10 placeholder:text-xs sm:placeholder:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={isLoading}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Minimal 8 karakter, kombinasi huruf besar, huruf kecil, angka, dan simbol (misal: !@#$%).</p>
            </Field>
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) => {
              const password = fieldApi.form.getFieldValue('password');
              if (!value || value.length < 6) return 'Konfirmasi password minimal 6 karakter';
              if (value !== password) return 'Konfirmasi password tidak cocok';
              return undefined;
            },
            onBlur: ({ value, fieldApi }) => {
              const password = fieldApi.form.getFieldValue('password');
              if (!value || value.length < 6) return 'Konfirmasi password minimal 6 karakter';
              if (value !== password) return 'Konfirmasi password tidak cocok';
              return undefined;
            },
          }}
        >
          {(field) => (
            <Field label="Konfirmasi Password" error={field.state.meta.errors[0]}>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Ulangi password"
                  disabled={isLoading}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="pr-10 placeholder:text-xs sm:placeholder:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  disabled={isLoading}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                  aria-label={showConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>
          )}
        </form.Field>
      </div>
    </section>
  );
}
