// app/admin/(dashboard)/business-categories/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { BusinessCategoryFormDialog, type BusinessCategoryRecord } from '@/components/admin/business-categories/business-category-form-dialog';
import { DeleteBusinessCategoryDialog } from '@/components/admin/business-categories/delete-business-category-dialog';

interface BusinessCategoryListItem extends BusinessCategoryRecord {
  createdAt: string;
  _count: { umkms: number };
}

async function fetchCategories(): Promise<BusinessCategoryListItem[]> {
  const res = await fetch('/api/admin/business-categories');
  if (!res.ok) throw new Error('Gagal memuat daftar kategori usaha');
  const data = await res.json();
  return data.data || [];
}

export default function AdminBusinessCategoriesPage() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'business-categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BusinessCategoryRecord | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<BusinessCategoryRecord | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'business-categories'] });
  }

  const columns: DataTableColumn<BusinessCategoryListItem>[] = [
    {
      header: 'Nama Kategori',
      accessor: (row) => <span className="font-medium">{toTitleCase(row.name)}</span>,
    },
    {
      header: 'Dipakai Oleh',
      accessor: (row) => <Badge variant="secondary">{row._count.umkms} UMKM</Badge>,
    },
  ];

  const actions: DataTableAction<BusinessCategoryListItem>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      onClick: (row) => {
        setEditingCategory(row);
        setFormOpen(true);
      },
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingCategory(row),
    },
  ];

  function searchFn(row: BusinessCategoryListItem, query: string) {
    return row.name.toLowerCase().includes(query.toLowerCase());
  }

  function sortFn(rows: BusinessCategoryListItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.name.localeCompare(b.name);
        case 'za':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Kategori Usaha</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar kategori usaha yang muncul di form registrasi UMKM.</p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Tambah Kategori
        </Button>
      </div>

      <DataTable
        data={categories}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari nama kategori..."
        isLoading={isLoading}
        emptyMessage="Belum ada kategori usaha. Klik 'Tambah Kategori' untuk mulai."
      />

      <BusinessCategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingCategory} onSuccess={invalidate} />

      <DeleteBusinessCategoryDialog category={deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)} onDeleted={invalidate} />
    </div>
  );
}
