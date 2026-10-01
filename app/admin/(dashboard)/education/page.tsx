// app/admin/(dashboard)/education/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { formatDate } from '@/lib/utils';
import { EDUCATION_CATEGORIES } from '@/schemas/content.schema';
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { DeleteContentDialog } from '@/components/shared/delete-content-dialog';

interface EducationListItem {
  id: string;
  title: string;
  category?: string;
  isPublished: boolean;
  createdAt: string;
}

function formatContentTitle(title: string) {
  const titleCased = toTitleCase(title);
  return titleCased
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchPosts(): Promise<EducationListItem[]> {
  const res = await fetch('/api/admin/education');
  if (!res.ok) throw new Error('Gagal memuat daftar artikel');
  const data = await res.json();
  return data.data || [];
}

function getCategoryLabel(categoryValue?: string) {
  const found = EDUCATION_CATEGORIES.find((c) => c.value === categoryValue);
  return found ? found.label : 'Umum';
}

export default function AdminEducationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin', 'education'],
    queryFn: fetchPosts,
    staleTime: 30 * 1000,
  });

  const [deletingPost, setDeletingPost] = useState<EducationListItem | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'education'] });
  }

  const columns: DataTableColumn<EducationListItem>[] = [
    {
      header: 'Judul',
      accessor: (row) => <span className="font-medium">{formatContentTitle(row.title)}</span>,
    },
    {
      header: 'Kategori',
      accessor: (row) => <Badge variant="outline">{getCategoryLabel(row.category)}</Badge>,
    },
    {
      header: 'Status',
      accessor: (row) => <Badge variant={row.isPublished ? 'default' : 'secondary'}>{row.isPublished ? 'Published' : 'Draft'}</Badge>,
    },
    {
      header: 'Dibuat',
      accessor: (row) => <span className="text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
  ];

  const actions: DataTableAction<EducationListItem>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      // ganti dari window.location.href ke router.push - dulu full page
      // reload, sekarang navigasi client-side murni
      onClick: (row) => router.push(`/admin/education/${row.id}/edit`),
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingPost(row),
    },
  ];

  function searchFn(row: EducationListItem, query: string) {
    const q = query.toLowerCase();
    const categoryLabel = getCategoryLabel(row.category).toLowerCase();
    return row.title.toLowerCase().includes(q) || categoryLabel.includes(q);
  }

  function sortFn(rows: EducationListItem[], sort: SortOption) {
    return [...rows].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Edukasi</h1>
          <p className="text-sm text-muted-foreground">Kelola artikel edukasi seputar sertifikasi halal untuk masyarakat.</p>
        </div>
        <Button
          render={
            <Link href="/admin/education/new">
              <Plus className="size-4" />
              Tulis Artikel
            </Link>
          }
          nativeButton={false}
        />
      </div>

      <DataTable
        data={posts}
        columns={columns}
        actions={actions}
        getRowId={(row) => row.id}
        searchFn={searchFn}
        sortFn={sortFn}
        searchPlaceholder="Cari judul atau kategori artikel..."
        isLoading={isLoading}
        emptyMessage="Belum ada artikel edukasi."
      />

      <DeleteContentDialog item={deletingPost} endpoint="/api/admin/education" onOpenChange={(open) => !open && setDeletingPost(null)} onDeleted={invalidate} />
    </div>
  );
}
