'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-10" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">Terjadi Kesalahan</h1>
        <p className="max-w-sm text-sm text-muted-foreground">Maaf, ada yang tidak berjalan sebagaimana mestinya. Coba muat ulang halaman, atau kembali ke beranda.</p>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RotateCcw className="size-4" />
          Coba Lagi
        </Button>
        <Button render={<Link href="/">Kembali ke Beranda</Link>} nativeButton={false} />
      </div>
    </div>
  );
}
