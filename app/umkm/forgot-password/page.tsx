'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { ArrowLeft, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      await res.json();
      setIsSent(true);
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
          <CardTitle className="text-xl">Lupa Password</CardTitle>
          <CardDescription>{isSent ? 'Cek email anda untuk link reset password' : 'Masukkan email akun UMKM anda, kami akan kirim link reset password'}</CardDescription>
        </CardHeader>

        <CardContent>
          {isSent ? (
            <div className="flex flex-col items-center gap-4 py-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="size-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Jika email <span className="font-medium text-foreground">{email}</span> terdaftar sebagai akun UMKM, kami sudah mengirimkan link reset password ke email tersebut. Link berlaku selama 1 jam.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="nama@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required />
              </div>

              <Button type="submit" disabled={isLoading} className="mt-2">
                {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link href="/umkm/login" className="inline-flex items-center gap-1.5 text-muted-foreground underline">
              <ArrowLeft className="size-3.5" />
              Kembali ke halaman masuk
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
