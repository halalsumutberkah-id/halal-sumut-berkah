// components/shared/multi-image-upload-field.tsx

'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// item bisa string (url gambar lama yang sudah tersimpan, dipakai saat edit)
// atau File (gambar baru yang baru dipilih, belum diupload ke Cloudinary)
export type ImageItem = File | string;

interface MultiImageUploadFieldProps {
  value: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  max?: number;
  disabled?: boolean;
  error?: string;
}

// komponen ini TIDAK upload apapun ke server saat file dipilih, cuma nyimpen
// File object di memory browser + preview lokal. Upload beneran baru terjadi
// pas form di-submit (sama pola kayak form register), biar tidak ada gambar
// yatim numpuk di Cloudinary kalau dialog dibatalkan
export function MultiImageUploadField({ value, onChange, max = 3, disabled, error }: MultiImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = value.map((item) => (typeof item === 'string' ? item : URL.createObjectURL(item)));
    setPreviewUrls(urls);

    return () => {
      urls.forEach((url, i) => {
        if (typeof value[i] !== 'string') URL.revokeObjectURL(url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (value.length >= max) {
      toast.error(`Maksimal ${max} gambar`);
      return;
    }

    onChange([...value, file]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={disabled} className="hidden" />

      <div className="flex flex-wrap gap-3">
        {previewUrls.map((url, index) => (
          <div key={index} className="relative size-24 overflow-hidden rounded-md border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Gambar ${index + 1}`} className="size-full object-cover" />
            <Button type="button" variant="destructive" size="icon" className="absolute right-1 top-1 size-6" onClick={() => handleRemove(index)} disabled={disabled}>
              <X className="size-3" />
            </Button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled}
            className="flex size-24 flex-col items-center justify-center gap-1 rounded-md border border-dashed text-muted-foreground hover:bg-muted disabled:opacity-50"
          >
            <Plus className="size-5" />
            <span className="text-xs">
              {value.length}/{max}
            </span>
          </button>
        )}
      </div>

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
