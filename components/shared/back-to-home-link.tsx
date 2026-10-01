// components/shared/back-to-home-link.tsx

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export function BackToHomeLink() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-4" />
      Kembali ke Beranda
    </Link>
  );
}
