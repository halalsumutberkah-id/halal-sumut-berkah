'use client';

import { useState } from 'react';
import { useForm } from '@tanstack/react-form';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { changePasswordFormObjectSchema, changePasswordFormSchema } from '@/schemas/change-password-form.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

type FieldName = keyof typeof changePasswordFormObjectSchema.shape;

function validateField(name: FieldName, value: string) {
  const result = changePasswordFormObjectSchema.shape[name].safeParse(value);
  return result.success ? undefined : result.error.issues[0].message;
}

const initialValues = {
  currentPassword: '',
  newPassword: '',
  confirmNewPassword: '',
};

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [visibility, setVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  function toggleVisibility(field: FieldName) {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  }

  const form = useForm({
    defaultValues: initialValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      const parsed = changePasswordFormSchema.safeParse(value);
      if (!parsed.success) {
        toast.error(parsed.error.issues[0].message);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch('/api/account/change-password', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: parsed.data.currentPassword,
            newPassword: parsed.data.newPassword,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
          return;
        }

        toast.success('Password berhasil diperbarui');
        form.reset(initialValues);
      } catch {
        toast.error('Terjadi kesalahan pada server');
      } finally {
        setIsLoading(false);
      }
    },
  });

  function renderPasswordField(name: FieldName, label: string, autoComplete: string, extraValidator?: (value: string) => string | undefined) {
    return (
      <form.Field
        name={name}
        validators={{
          onChange: ({ value }) => extraValidator?.(value) ?? validateField(name, value),
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>{label}</Label>
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type={visibility[name] ? 'text' : 'password'}
                autoComplete={autoComplete}
                disabled={isLoading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => toggleVisibility(name)}
                disabled={isLoading}
                tabIndex={-1}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                aria-label={visibility[name] ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {visibility[name] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
          </div>
        )}
      </form.Field>
    );
  }

  return (
    <Card className="max-w-md">
      <CardContent className="pt-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          {renderPasswordField('currentPassword', 'Password Lama', 'current-password')}
          {renderPasswordField('newPassword', 'Password Baru', 'new-password')}

          <form.Field
            name="confirmNewPassword"
            validators={{
              onChangeListenTo: ['newPassword'],
              onChange: ({ value, fieldApi }) => {
                if (!value) return 'Konfirmasi password wajib diisi';
                const newPassword = fieldApi.form.getFieldValue('newPassword');
                if (value !== newPassword) return 'Konfirmasi password tidak cocok';
                return undefined;
              },
            }}
          >
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={field.name}>Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    type={visibility.confirmNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    disabled={isLoading}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleVisibility('confirmNewPassword')}
                    disabled={isLoading}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    aria-label={visibility.confirmNewPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {visibility.confirmNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
              </div>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || isLoading} className="mt-2">
                {isLoading ? 'Menyimpan...' : 'Ganti Password'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
}
