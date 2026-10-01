'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type DeferredImageValue = File | string | null;

interface DeferredImageFieldProps {
  label: string;
  value: DeferredImageValue;
  onChange: (value: DeferredImageValue) => void;
  disabled?: boolean;
  error?: string;
}

export function DeferredImageField({ label, value, onChange, disabled, error }: DeferredImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(value);
  }, [value]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onChange(file);
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="flex flex-col gap-2">
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} disabled={disabled} className="hidden" />

      {previewUrl ? (
        <div className="relative h-40 w-full max-w-xs overflow-hidden rounded-md border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt={label} className="size-full object-cover" />
          <Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2 size-7" onClick={() => onChange(null)} disabled={disabled}>
            <X className="size-3.5" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="flex h-40 w-full max-w-xs flex-col items-center justify-center gap-1.5 rounded-md border border-dashed text-muted-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          <ImagePlus className="size-6" />
          <span className="text-xs">Pilih {label}</span>
        </button>
      )}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
