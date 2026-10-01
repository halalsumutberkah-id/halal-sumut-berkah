// components/admin/lp3h/lp3h-credentials-dialog.tsx

'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Lp3hCredentialsDialogProps {
  credentials: { email: string; password: string } | null;
  onClose: () => void;
}

export function Lp3hCredentialsDialog({ credentials, onClose }: Lp3hCredentialsDialogProps) {
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  function handleCopy() {
    if (!credentials) return;
    const text = `Email: ${credentials.email}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Kredensial disalin ke clipboard');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={!!credentials} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Akun LP3H Berhasil Dibuat</DialogTitle>
          <DialogDescription>
            Salin kredensial berikut dan kirimkan ke LP3H terkait. Password ini <strong>tidak bisa dilihat lagi</strong> setelah dialog ini ditutup.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 rounded-md border bg-muted/50 p-4 font-mono text-sm">
          <div>
            <span className="text-muted-foreground">Email: </span>
            {credentials.email}
          </div>
          <div>
            <span className="text-muted-foreground">Password: </span>
            {credentials.password}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Tersalin' : 'Salin'}
          </Button>
          <Button onClick={onClose}>Selesai</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
