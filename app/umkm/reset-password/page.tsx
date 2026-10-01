'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Eye, EyeOff, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    if (!token) {
      toast.error('Link reset password tidak valid, minta link baru');
      return;
    }

    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success('Password berhasil diubah, silakan masuk');
      router.push('/umkm/login');
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={72} height={72} className="mx-auto mb-2" />
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-6" />
          </div>
          <CardTitle className="text-xl">Buat Password Baru</CardTitle>
          <CardDescription>Masukkan password baru untuk akun anda.</CardDescription>
        </CardHeader>

        <CardContent>
          {!token ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <p className="text-sm text-destructive">Link reset password tidak valid atau sudah kedaluwarsa.</p>
              <Link href="/umkm/forgot-password" className="text-sm font-medium text-primary underline">
                Minta link baru
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password Baru</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} className="pr-10" />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} disabled={isLoading} tabIndex={-1} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" disabled={isLoading} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>

              <Button type="submit" disabled={isLoading} className="mt-2">
                {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordContent />
    </Suspense>
  );
}
