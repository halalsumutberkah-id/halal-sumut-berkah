'use client';

import { useEffect, useMemo, useState } from 'react';
import { MoreHorizontal, ArrowUp, ArrowDown, ArrowUpDown, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ListToolbar, type SortOption } from '@/components/shared/list-toolbar';
import { PaginationControl } from '@/components/shared/pagination-control';

export interface DataTableColumn<T> {
  // opsional: key stabil buat React. Kalau tidak diisi, fallback ke index.
  id?: string;
  // bisa string biasa atau ReactNode (misal dropdown filter di head kolom)
  header: React.ReactNode;
  accessor: (row: T) => React.ReactNode;
  className?: string;
  // A6 - opsional: kalau diisi, header kolom ini dapat tombol sort
  // (klik kayak di Excel: asc -> desc -> off). Return nilai MENTAH yang
  // bisa dibandingkan (bukan JSX dari accessor) - string/number/Date,
  // atau null kalau baris itu gak punya nilai (selalu ditaruh paling
  // belakang). Kolom yang gak diisi sortKey kelakuannya PERSIS seperti
  // sebelumnya (gak ada tombol, dropdown ListToolbar yang menentukan).
  sortKey?: (row: T) => string | number | Date | null;
}

export interface DataTableAction<T> {
  label: string;
  icon: LucideIcon;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  hidden?: (row: T) => boolean;
}

interface ColumnSortState {
  id: string;
  direction: 'asc' | 'desc';
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  getRowId: (row: T) => string;
  searchFn: (row: T, query: string) => boolean;
  sortFn: (data: T[], sort: SortOption) => T[];
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySearchMessage?: string;
  pageSize?: number;
  // diteruskan langsung ke ListToolbar - dipakai buat filter custom
  // per-halaman (contoh: filter status halal di halaman produk)
  filterSlot?: React.ReactNode;
}

function compareValues(a: string | number | Date | null, b: string | number | Date | null): number {
  // baris tanpa nilai selalu ditaruh paling belakang, apapun arah sort-nya
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  getRowId,
  searchFn,
  sortFn,
  searchPlaceholder = 'Cari...',
  isLoading = false,
  emptyMessage = 'Belum ada data.',
  emptySearchMessage = 'Tidak ada data yang cocok dengan pencarian.',
  pageSize = 10,
  filterSlot,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');
  const [page, setPage] = useState(1);
  // A6 - sort per-kolom (klik header). null = nonaktif, dropdown
  // ListToolbar (prop `sort` + `sortFn`) yang berlaku
  const [columnSort, setColumnSort] = useState<ColumnSortState | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, sort, columnSort]);

  function handleHeaderSortClick(colId: string) {
    setColumnSort((prev) => {
      if (!prev || prev.id !== colId) return { id: colId, direction: 'asc' };
      if (prev.direction === 'asc') return { id: colId, direction: 'desc' };
      return null; // toggle ketiga kali = balik ke dropdown sort
    });
  }

  const filteredSorted = useMemo(() => {
    const filtered = search ? data.filter((row) => searchFn(row, search)) : data;

    if (columnSort) {
      const col = columns.find((c, i) => (c.id ?? String(i)) === columnSort.id);
      if (col?.sortKey) {
        const dir = columnSort.direction === 'asc' ? 1 : -1;
        return [...filtered].sort((a, b) => compareValues(col.sortKey!(a), col.sortKey!(b)) * dir);
      }
    }

    return sortFn(filtered, sort);
  }, [data, search, sort, searchFn, sortFn, columnSort, columns]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const paginated = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  const colSpan = columns.length + (actions ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <ListToolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder={searchPlaceholder} sortValue={sort} onSortChange={setSort} filterSlot={filterSlot} />

      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col, i) => {
                const colId = col.id ?? String(i);
                const isActive = columnSort?.id === colId;
                return (
                  <TableHead key={colId} className={col.className}>
                    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      {col.header}
                      {col.sortKey && (
                        <button type="button" onClick={() => handleHeaderSortClick(colId)} className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Urutkan kolom ini">
                          {isActive ? columnSort!.direction === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" /> : <ArrowUpDown className="size-3.5 opacity-40" />}
                        </button>
                      )}
                    </div>
                  </TableHead>
                );
              })}
              {actions && <TableHead className="w-16">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={colSpan}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))}

            {!isLoading && paginated.length === 0 && (
              <TableRow>
                <TableCell colSpan={colSpan} className="py-8 text-center text-muted-foreground">
                  {search ? emptySearchMessage : emptyMessage}
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              paginated.map((row) => (
                <TableRow key={getRowId(row)}>
                  {columns.map((col, i) => (
                    <TableCell key={col.id ?? i} className={col.className}>
                      {col.accessor(row)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          {actions
                            .filter((action) => !action.hidden?.(row))
                            .map((action) => {
                              const Icon = action.icon;
                              return (
                                <DropdownMenuItem key={action.label} variant={action.variant} onClick={() => action.onClick(row)}>
                                  <Icon className="size-4" />
                                  {action.label}
                                </DropdownMenuItem>
                              );
                            })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {!isLoading && <PaginationControl page={page} totalPages={totalPages} totalItems={filteredSorted.length} pageSize={pageSize} onPageChange={setPage} />}
    </div>
  );
}
