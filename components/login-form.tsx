'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import { signIn } from 'next-auth/react';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema } from '@/schemas/auth.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginFormProps {
  dashboardPath: string;
}

export function LoginForm({ dashboardPath }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      // guard biar tidak bisa submit dobel selama proses berjalan
      if (isLoading) return;
      setIsLoading(true);

      const result = await signIn('credentials', {
        ...value,
        redirect: false,
      });

      if (result?.error) {
        setIsLoading(false);

        if (result.error === 'email_not_verified') {
          toast.error('Email anda belum diverifikasi. Silakan verifikasi dulu.');
          router.push(`/umkm/verify-email?email=${encodeURIComponent(value.email)}`);
          return;
        }

        toast.error('Email atau password salah');
        return;
      }

      toast.success('Berhasil masuk');

      // full reload biar cookie session baru pasti terbawa, tidak race
      window.location.href = dashboardPath;
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) => {
            const result = loginSchema.shape.email.safeParse(value);
            return result.success ? undefined : result.error.issues[0].message;
          },
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              placeholder="nama@email.com"
              autoComplete="email"
              disabled={isLoading}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) => {
            const result = loginSchema.shape.password.safeParse(value);
            return result.success ? undefined : result.error.issues[0].message;
          },
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Password</Label>
            <div className="relative">
              <Input
                id={field.name}
                name={field.name}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="pr-10"
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
            {field.state.meta.errors.length > 0 && <span className="text-xs text-destructive">{field.state.meta.errors[0]}</span>}
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit || isLoading} className="mt-2">
            {isLoading ? 'Memproses...' : 'Masuk'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
