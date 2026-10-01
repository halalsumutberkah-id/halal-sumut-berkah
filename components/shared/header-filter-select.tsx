// components/shared/header-filter-select.tsx

'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface HeaderFilterSelectProps {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}

// dropdown filter kecil dipakai di head kolom tabel (pola "kayak Excel") -
// dipakai bareng di semua tabel Admin. h-7 + border-none biar nyatu sama
// header, tapi tetap keliatan sebagai control (ada chevron dari
// SelectTrigger bawaan). Compact di mobile (max-w), lega di desktop.
export function HeaderFilterSelect({ value, onChange, placeholder, options }: HeaderFilterSelectProps) {
  const activeLabel = options.find((o) => o.value === value)?.label;
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? 'all')}>
      <SelectTrigger className="h-7 w-auto max-w-35 justify-start gap-1 border-none bg-transparent px-1 shadow-none hover:bg-muted/50 sm:max-w-none">
        <SelectValue className="truncate">{value === 'all' ? placeholder : activeLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua {placeholder}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
