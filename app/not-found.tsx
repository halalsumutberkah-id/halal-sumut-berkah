import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 px-4 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <FileQuestion className="size-10" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-foreground">404</h1>
        <p className="text-lg font-medium text-foreground">Halaman tidak ditemukan</p>
        <p className="max-w-sm text-sm text-muted-foreground">Halaman yang anda cari mungkin sudah dipindahkan, dihapus, atau alamatnya salah ketik.</p>
      </div>

      <Button render={<Link href="/">Kembali ke Beranda</Link>} nativeButton={false} />
    </div>
  );
}
