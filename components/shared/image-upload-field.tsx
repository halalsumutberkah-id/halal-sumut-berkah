'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from '@/lib/upload-file';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  disabled?: boolean;
  error?: string;
}

export function ImageUploadField({ value, onChange, folder, disabled, error }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch {
      // gagal upload, biarkan value tetap seperti semula
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={disabled || isUploading} className="hidden" />

      {value ? (
        <div className="relative w-full max-w-xs overflow-hidden rounded-md border">
          <Image src={value} alt="Thumbnail" width={320} height={180} className="h-40 w-full object-cover" />
          <Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2 size-7" onClick={() => onChange('')} disabled={disabled}>
            <X className="size-4" />
          </Button>
        </div>
      ) : (
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={disabled || isUploading} className="w-full max-w-xs justify-start font-normal">
          {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {isUploading ? 'Mengunggah...' : 'Unggah Gambar'}
        </Button>
      )}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
