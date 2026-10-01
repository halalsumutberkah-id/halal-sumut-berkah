// app/admin/(dashboard)/news/[id]/edit/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { NewsForm, type NewsRecord } from '@/components/admin/news/news-form';
import { toTitleCase } from '@/lib/title-case';

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

async function fetchPost(id: string): Promise<NewsRecord> {
  const res = await fetch(`/api/admin/news/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Berita tidak ditemukan');
  return data.data;
}

export default function EditNewsPage() {
  const params = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['admin', 'news', params.id],
    queryFn: () => fetchPost(params.id),
    staleTime: 10 * 1000,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit Berita & Kegiatan</h1>
        <p className="text-sm text-muted-foreground">Perbarui konten yang sudah ada.</p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && post && (
        <NewsForm
          initialData={{
            ...post,
            title: formatNewsTitle(post.title),
          }}
        />
      )}
    </div>
  );
}
