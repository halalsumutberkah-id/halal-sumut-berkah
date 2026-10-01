// app/admin/(dashboard)/news/page.tsx

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
import { DataTable, type DataTableColumn, type DataTableAction } from '@/components/shared/data-table';
import type { SortOption } from '@/components/shared/list-toolbar';
import { DeleteContentDialog } from '@/components/shared/delete-content-dialog';

interface NewsListItem {
  id: string;
  title: string;
  isPublished: boolean;
  createdAt: string;
}

function formatNewsTitle(title: string) {
  const titleCased = toTitleCase(title);
  return titleCased
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function fetchPosts(): Promise<NewsListItem[]> {
  const res = await fetch('/api/admin/news');
  if (!res.ok) throw new Error('Gagal memuat daftar berita');
  const data = await res.json();
  return data.data || [];
}

export default function AdminNewsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin', 'news'],
    queryFn: fetchPosts,
    staleTime: 30 * 1000,
  });

  const [deletingPost, setDeletingPost] = useState<NewsListItem | null>(null);

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'news'] });
  }

  const columns: DataTableColumn<NewsListItem>[] = [
    {
      header: 'Judul',
      accessor: (row) => <span className="font-medium">{formatNewsTitle(row.title)}</span>,
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

  const actions: DataTableAction<NewsListItem>[] = [
    {
      label: 'Edit',
      icon: Pencil,
      // ganti dari window.location.href ke router.push - dulu full page
      // reload (request ulang seluruh halaman dari server termasuk
      // layout & requireRole), sekarang navigasi client-side murni
      onClick: (row) => router.push(`/admin/news/${row.id}/edit`),
    },
    {
      label: 'Hapus',
      icon: Trash2,
      variant: 'destructive',
      onClick: (row) => setDeletingPost(row),
    },
  ];

  function searchFn(row: NewsListItem, query: string) {
    return row.title.toLowerCase().includes(query.toLowerCase());
  }

  function sortFn(rows: NewsListItem[], sort: SortOption) {
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
          <h1 className="text-xl font-semibold text-foreground">Berita & Kegiatan</h1>
          <p className="text-sm text-muted-foreground">Kelola berita dan informasi kegiatan seputar program sertifikasi halal.</p>
        </div>
        <Button
          render={
            <Link href="/admin/news/new">
              <Plus className="size-4" />
              Tulis Berita
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
        searchPlaceholder="Cari judul berita..."
        isLoading={isLoading}
        emptyMessage="Belum ada berita atau kegiatan."
      />

      <DeleteContentDialog item={deletingPost} endpoint="/api/admin/news" onOpenChange={(open) => !open && setDeletingPost(null)} onDeleted={invalidate} />
    </div>
  );
}
