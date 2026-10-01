// app/umkm/verify-email/page.tsx

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';

  const [email, setEmail] = useState(emailFromQuery);
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (isVerifying) return;

    if (otp.length !== 6) {
      toast.error('Kode OTP harus 6 digit');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success('Email berhasil diverifikasi, silakan masuk');
      router.push('/umkm/login');
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (isResending || cooldown > 0) return;

    if (!email) {
      toast.error('Masukkan email anda dulu');
      return;
    }

    setIsResending(true);
    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Terjadi kesalahan, silakan coba lagi');
        return;
      }

      toast.success('Kode OTP baru sudah dikirim ke email anda');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch {
      toast.error('Terjadi kesalahan pada server');
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={72} height={72} className="mx-auto mb-2" />
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-6" />
          </div>
          <CardTitle className="text-xl">Verifikasi Email</CardTitle>
          <CardDescription>Masukkan 6 digit kode yang kami kirim ke email anda untuk mengaktifkan akun.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isVerifying} readOnly={!!emailFromQuery} className={emailFromQuery ? 'bg-muted' : undefined} placeholder="nama@email.com" />
              {emailFromQuery && <p className="text-xs text-muted-foreground">Kode OTP dikirim ke email ini, tidak bisa diubah di halaman ini.</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="otp">Kode OTP</Label>
              <Input id="otp" inputMode="numeric" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} disabled={isVerifying} placeholder="123456" className="text-center text-2xl tracking-[0.5em]" />
            </div>

            <Button type="submit" disabled={isVerifying} className="mt-2">
              {isVerifying ? 'Memverifikasi...' : 'Verifikasi'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm text-muted-foreground">
            Tidak menerima kode?{' '}
            <button type="button" onClick={handleResend} disabled={isResending || cooldown > 0} className="font-medium text-primary underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline">
              {cooldown > 0 ? `Kirim ulang (${cooldown}s)` : 'Kirim ulang kode'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
