// components/public/sections/self-declare-promo-section.tsx

import Link from 'next/link';
import { ShieldCheck, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function SelfDeclarePromoSection() {
  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="flex flex-col items-start gap-6 rounded-2xl bg-primary p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary-foreground/10 text-primary-foreground">
            <ShieldCheck className="size-7" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="w-fit rounded-full bg-yellow-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neutral-900">Gratis, Tanpa Biaya</span>
            <h2 className="text-xl font-bold leading-tight text-primary-foreground sm:text-2xl">Sertifikasi Halal Gratis Lewat Self Declare</h2>
            <p className="max-w-xl text-sm leading-relaxed text-primary-foreground/85 sm:text-base">Ajukan produk anda, Admin akan memverifikasi berkas dan menugaskan LP3H resmi untuk mendampingi anda hingga Sertifikat Halal terbit.</p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            render={
              <Link href="/umkm/register">
                Ajukan Sekarang
                <ArrowRight className="size-4" />
              </Link>
            }
            nativeButton={false}
            className="h-auto justify-center rounded-full bg-yellow-500 px-6 py-3 font-semibold text-neutral-900 hover:bg-yellow-400"
          />
          <Button
            variant="outline"
            render={
              <Link href="/sertifikasi-gratis">
                <BookOpen className="size-4" />
                Pelajari Lebih Lanjut
              </Link>
            }
            nativeButton={false}
            className="h-auto justify-center rounded-full border-primary-foreground/30 bg-primary-foreground/10 px-6 py-3 font-medium text-primary-foreground hover:bg-primary-foreground hover:text-primary"
          />
        </div>
      </div>
    </section>
  );
}
