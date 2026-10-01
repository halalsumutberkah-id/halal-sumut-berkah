// app/umkm/login/page.tsx

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/login-form';
import { BackToHomeLink } from '@/components/shared/back-to-home-link';
import { generateMetadata } from '@/lib/seo';

export const metadata: Metadata = generateMetadata({
  title: 'Masuk sebagai UMKM',
  noIndex: true,
});

export default function UmkmLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={72} height={72} className="mx-auto mb-2" />
          <CardTitle className="text-xl">Masuk sebagai UMKM</CardTitle>
          <CardDescription>Halal Sumut Berkah</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm dashboardPath="/umkm/dashboard" />

          <p className="mt-4 text-center text-sm">
            <Link href="/umkm/forgot-password" className="text-muted-foreground underline">
              Lupa password?
            </Link>
          </p>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Belum punya akun UMKM?{' '}
            <Link href="/umkm/register" className="font-medium text-foreground underline">
              Daftar di sini
            </Link>
          </p>
        </CardContent>
      </Card>
      <BackToHomeLink />
    </div>
  );
}
