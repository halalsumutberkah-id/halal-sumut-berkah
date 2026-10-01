// app/umkm/register/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '@tanstack/react-form';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';
import { registerSchema } from '@/schemas/register.schema';
import { uploadDocument, formatErrorMessage } from '@/lib/upload-file';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BackToHomeLink } from '@/components/shared/back-to-home-link';
import { defaultValues } from '@/components/umkm/register/register-shared';
import { AccountSection } from '@/components/umkm/register/account-section';
import { BusinessOwnerSection } from '@/components/umkm/register/business-owner-section';
import { BusinessSection } from '@/components/umkm/register/business-section';

interface BusinessCategory {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [categoryList, setCategoryList] = useState<BusinessCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    fetch('/api/public/business-categories')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat kategori usaha');
        return res.json();
      })
      .then((res) => setCategoryList(res.data || []))
      .catch((err) => toast.error(formatErrorMessage(err, 'Gagal memuat daftar kategori usaha')));
  }, []);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (isLoading) return;

      if (!value.ktpFile || !value.nibFile) {
        toast.error('KTP dan NIB wajib diunggah');
        return;
      }

      setIsLoading(true);

      try {
        // 1. Upload KTP
        setUploadStatus('Mengunggah KTP...');
        const ktpUrl = await uploadDocument(value.ktpFile, 'umkm-documents');

        // 2. Upload Logo jika ada
        let logoUrl = '';
        if (value.logoFile) {
          setUploadStatus('Mengunggah Logo Usaha...');
          logoUrl = await uploadDocument(value.logoFile, 'umkm-documents');
        }

        // 3. Upload NIB Dokumen (PDF)
        setUploadStatus('Mengunggah NIB...');
        const nibUrl = await uploadDocument(value.nibFile, 'umkm-documents');

        setUploadStatus('Mendaftarkan akun...');

        const payload = {
          ...value,
          customBusinessCategory: value.businessCategoryId === 'lainnya' ? (value.customBusinessCategory || '').trim() : '',
          ktpUrl,
          logoUrl,
          nibUrl,
        };

        const parsed = registerSchema.safeParse(payload);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0].message);
          setIsLoading(false);
          setUploadStatus('');
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed.data),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
          toast.error(data?.error || 'Terjadi kesalahan saat pendaftaran');
          return;
        }

        toast.success('Registrasi berhasil! Cek email anda untuk kode verifikasi.');
        router.push(`/umkm/verify-email?email=${encodeURIComponent(value.email)}`);
      } catch (error) {
        console.error('Register error:', error);
        toast.error(formatErrorMessage(error, 'Gagal memproses pendaftaran, silakan coba lagi'));
      } finally {
        setIsLoading(false);
        setUploadStatus('');
      }
    },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-muted/30 px-4 py-8 md:py-12">
      <Card className="w-full max-w-xl md:max-w-3xl lg:max-w-4xl">
        <CardHeader className="text-center">
          <Image src="/images/logo_sumutprov.png" alt="Logo Pemerintah Provinsi Sumatera Utara" width={72} height={72} className="mx-auto mb-2" />
          <CardTitle className="text-xl">Daftar sebagai UMKM</CardTitle>
          <CardDescription>Lengkapi data diri dan usaha anda untuk mulai menggunakan Halal Sumut Berkah</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="flex flex-col gap-6"
          >
            <AccountSection form={form} isLoading={isLoading} />
            <BusinessOwnerSection form={form} isLoading={isLoading} />
            <BusinessSection form={form} isLoading={isLoading} categoryList={categoryList} />

            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => (
                <Button type="submit" disabled={!canSubmit || isLoading} className="mt-2">
                  {isLoading ? uploadStatus || 'Memproses pendaftaran...' : 'Daftar'}
                </Button>
              )}
            </form.Subscribe>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{' '}
            <Link href="/umkm/login" className="font-medium text-foreground underline">
              Masuk di sini
            </Link>
          </p>
        </CardContent>
      </Card>
      <BackToHomeLink />
    </div>
  );
}
