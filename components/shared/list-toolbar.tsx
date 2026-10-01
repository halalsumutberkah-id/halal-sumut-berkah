'use client';

import { Search, ArrowDownWideNarrow, ArrowUpNarrowWide, ArrowDownAZ, ArrowUpZA } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type SortOption = 'newest' | 'oldest' | 'az' | 'za';

export const SORT_OPTIONS: { value: SortOption; label: string; icon: typeof ArrowDownWideNarrow }[] = [
  { value: 'newest', label: 'Terbaru', icon: ArrowDownWideNarrow },
  { value: 'oldest', label: 'Terlama', icon: ArrowUpNarrowWide },
  { value: 'az', label: 'A-Z', icon: ArrowDownAZ },
  { value: 'za', label: 'Z-A', icon: ArrowUpZA },
];

interface ListToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  sortValue: SortOption;
  onSortChange: (value: SortOption) => void;
  // slot generik buat filter custom per-halaman (misal filter status), di
  // assign lewat DataTable saat dipakai - opsional, gak ganggu halaman
  // lain yang gak butuh filter tambahan
  filterSlot?: React.ReactNode;
}

export function ListToolbar({ searchValue, onSearchChange, searchPlaceholder = 'Cari...', sortValue, onSortChange, filterSlot }: ListToolbarProps) {
  const selected = SORT_OPTIONS.find((option) => option.value === sortValue) ?? SORT_OPTIONS[0];
  const SelectedIcon = selected.icon;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={searchValue} onChange={(e) => onSearchChange(e.target.value)} placeholder={searchPlaceholder} className="pl-9" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {filterSlot}

        <Select value={sortValue} onValueChange={(v) => onSortChange(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue>
              <span className="flex items-center gap-2">
                <SelectedIcon className="size-4 text-muted-foreground" />
                {selected.label}
              </span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <span className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    {option.label}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
