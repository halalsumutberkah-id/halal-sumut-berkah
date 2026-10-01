'use client';

import { useRef, useState } from 'react';
import { Upload, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { uploadDocument } from '@/lib/upload-file';

interface FileUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
}

export function FileUploadField({ label, value, onChange, error, disabled }: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      const url = await uploadDocument(file, 'umkm-documents');
      onChange(url);
    } catch {
      onChange('');
      setFileName('');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={disabled || isUploading} className="hidden" />

      <Button type="button" variant="outline" disabled={disabled || isUploading} onClick={() => inputRef.current?.click()} className={cn('justify-start font-normal', error && 'border-destructive text-destructive')}>
        {isUploading ? <Loader2 className="size-4 animate-spin" /> : value ? <CheckCircle2 className="size-4 text-green-600" /> : <Upload className="size-4" />}
        <span className="truncate">{isUploading ? 'Mengunggah...' : fileName || (value ? 'Berkas berhasil diunggah' : `Pilih berkas ${label.toLowerCase()}`)}</span>
      </Button>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
