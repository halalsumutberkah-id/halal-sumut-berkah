'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link disalin');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin link');
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="h-auto gap-1.5 rounded-full px-3 py-1.5 text-xs">
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Tersalin' : 'Salin Link'}
    </Button>
  );
}
