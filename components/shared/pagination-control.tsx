'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationControlProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaginationControl({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationControlProps) {
  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Menampilkan {start}-{end} dari {totalItems} data
      </p>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Halaman {page} dari {totalPages || 1}
        </span>
        <Button variant="outline" size="icon" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
