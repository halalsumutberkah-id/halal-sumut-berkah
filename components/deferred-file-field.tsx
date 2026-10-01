// components/deferred-file-field.tsx

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, FileText } from 'lucide-react';

interface DeferredFileFieldProps {
  label: string;
  description?: string;
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
  maxSizeMB?: number;
  error?: string;
}

export function DeferredFileField({ label, description, value, onChange, disabled = false, accept = 'application/pdf,image/jpeg,image/png,image/webp', maxSizeMB = 3, error }: DeferredFileFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Ukuran berkas melebihi batas maksimal ${maxSizeMB} MB`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <input ref={fileInputRef} type="file" accept={accept} onChange={handleFileChange} disabled={disabled} className="hidden" />

      {!value ? (
        <Button type="button" variant="outline" disabled={disabled} onClick={() => fileInputRef.current?.click()} className="flex h-10 w-full items-center justify-center gap-2 border-dashed text-xs sm:text-sm">
          <Upload className="h-4 w-4" />
          Pilih Berkas
        </Button>
      ) : (
        <div className="flex items-center justify-between rounded-md border bg-muted/40 p-2.5 text-xs sm:text-sm">
          <div className="flex items-center gap-2 truncate pr-2">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate font-medium">{value.name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">({(value.size / (1024 * 1024)).toFixed(2)} MB)</span>
          </div>
          <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={handleRemove} className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
