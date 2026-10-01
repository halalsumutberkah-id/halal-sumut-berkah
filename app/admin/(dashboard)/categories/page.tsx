// app/admin/(dashboard)/categories/page.tsx

'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { CategoryFormDialog, type CategoryRecord } from '@/components/admin/categories/category-form-dialog';
import { DeleteCategoryDialog } from '@/components/admin/categories/delete-category-dialog';

interface CategoryListItem extends CategoryRecord {
  slug: string;
  createdAt: string;
  _count: { products: number };
}

async function fetchCategories(): Promise<CategoryListItem[]> {
  const res = await fetch('/api/admin/categories');
  if (!res.ok) throw new Error('Gagal memuat daftar kategori');
  const data = await res.json();
  return data.data || [];
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 1000,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRecord | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<CategoryRecord | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
  }

  const columns: DataTableColumn<CategoryListItem>[] = [
    {
      header: 'Nama Kategori',
      accessor: (row) => <span className="font-medium">{toTitleCase(row.name)}</span>,
    },
    {
      header: 'Jumlah Produk',
      accessor: (row) => <Badge variant="secondary">{row._count.products} produk</Badge>,
    },
  ];

  const actions: DataTableAction<CategoryListItem>[] = [
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

  function searchFn(row: CategoryListItem, query: string) {
    return row.name.toLowerCase().includes(query.toLowerCase());
  }

  function sortFn(rows: CategoryListItem[], sort: SortOption) {
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
          <h1 className="text-xl font-semibold text-foreground">Manajemen Kategori</h1>
          <p className="text-sm text-muted-foreground">Kelola kategori produk yang dapat dipilih UMKM saat menambahkan produk.</p>
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

      <DataTable data={categories} columns={columns} actions={actions} getRowId={(row) => row.id} searchFn={searchFn} sortFn={sortFn} searchPlaceholder="Cari nama kategori..." isLoading={isLoading} emptyMessage="Belum ada kategori." />

      <CategoryFormDialog open={formOpen} onOpenChange={setFormOpen} category={editingCategory} onSuccess={invalidate} />

      <DeleteCategoryDialog category={deletingCategory} onOpenChange={(open) => !open && setDeletingCategory(null)} onDeleted={invalidate} />
    </div>
  );
}
