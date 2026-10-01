// app/admin/(dashboard)/education/[id]/edit/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { EducationForm, type EducationRecord } from '@/components/admin/education/education-form';
import { toTitleCase } from '@/lib/title-case';

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

async function fetchPost(id: string): Promise<EducationRecord> {
  const res = await fetch(`/api/admin/education/${id}`);
  const data = await res.json();
  if (!res.ok || !data.data) throw new Error('Artikel tidak ditemukan');
  return data.data;
}

export default function EditEducationPage() {
  const params = useParams<{ id: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['admin', 'education', params.id],
    queryFn: () => fetchPost(params.id),
    staleTime: 10 * 1000,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Edit Artikel Edukasi</h1>
        <p className="text-sm text-muted-foreground">Perbarui konten artikel yang sudah ada.</p>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!isLoading && post && (
        <EducationForm
          initialData={{
            ...post,
            title: formatContentTitle(post.title),
          }}
        />
      )}
    </div>
  );
}
