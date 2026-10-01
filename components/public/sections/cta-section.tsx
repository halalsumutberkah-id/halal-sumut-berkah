import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CtaSection() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
        {/* GRID 1 - ajakan daftar, bg primary */}
        <div className="flex flex-col justify-center gap-4 rounded-2xl bg-primary p-6 sm:p-8">
          <h2 className="text-2xl font-bold leading-tight text-primary-foreground sm:text-3xl">Ingin Produk Anda Tersertifikasi Halal?</h2>
          <p className="text-sm leading-relaxed text-primary-foreground/85 sm:text-base">Mulai langkah pertama menuju keberkahan bisnis anda.</p>
          <Button
            render={
              <Link href="/umkm/register">
                Daftar Sekarang
                <ArrowRight className="size-4" />
              </Link>
            }
            nativeButton={false}
            className="h-auto w-fit rounded-full bg-yellow-500 px-6 py-3 font-semibold text-neutral-900 hover:bg-yellow-400"
          />
        </div>

        {/* GRID 2 - logo pendukung, putih dengan border */}
        <div className="flex flex-col justify-center gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 sm:p-8">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Didukung Oleh</span>
          <div className="flex min-w-0 flex-1 flex-col items-center justify-center gap-6 sm:flex-row sm:gap-6 lg:gap-8">
            <div className="relative flex h-16 w-full max-w-45 items-center justify-center sm:h-20 sm:max-w-50">
              <Image src="/images/logo-diskopukm-sumut.png" alt="Dinas Koperasi dan UKM Sumatera Utara" width={320} height={320} className="max-h-full max-w-full object-contain" />
            </div>

            <div className="h-px w-14 shrink-0 bg-border sm:h-14 sm:w-px" />

            <div className="relative flex h-16 w-full max-w-50 items-center justify-center sm:h-20 sm:max-w-60">
              <Image src="/images/logo-bank-indonesia.png" alt="Bank Indonesia" width={400} height={400} className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
