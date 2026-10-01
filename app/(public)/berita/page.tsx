// app/berita/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, Newspaper, FileQuestion, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PaginationControl } from '@/components/shared/pagination-control';
import { formatDate } from '@/lib/utils';
import { toTitleCase } from '@/lib/title-case';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  content: string;
  publishedAt: string | null;
}

interface NewsResponse {
  data: NewsItem[];
  total: number;
  page: number;
  totalPages: number;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Terbaru ke Terlama' },
  { value: 'oldest', label: 'Terlama ke Terbaru' },
  { value: 'az', label: 'Judul A ke Z' },
  { value: 'za', label: 'Judul Z ke A' },
];

function formatContentTitle(title: string) {
  const titleCased = toTitleCase(title);
  return titleCased
    .replace(/\blph\b/gi, 'LPH')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\bbpjph\b/gi, 'BPJPH')
    .replace(/\bmui\b/gi, 'MUI')
    .replace(/\bbpom\b/gi, 'BPOM')
    .replace(/\bpirt\b/gi, 'PIRT')
    .replace(/\bhaki\b/gi, 'HAKI')
    .replace(/\bslhs\b/gi, 'SLHS')
    .replace(/\bpt\b/gi, 'PT')
    .replace(/\bcv\b/gi, 'CV')
    .replace(/\bud\b/gi, 'UD')
    .replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

function stripHtml(html: string) {
  return html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchNews(page: number, search: string, sort: string): Promise<NewsResponse> {
  const params = new URLSearchParams({ page: String(page), sort });
  if (search) params.set('search', search);

  const res = await fetch(`/api/public/news?${params.toString()}`);
  if (!res.ok) throw new Error('Gagal memuat berita');
  return res.json();
}

export default function BeritaPage() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');

  const { data, isLoading } = useQuery({
    queryKey: ['public', 'news', page, search, sort],
    queryFn: () => fetchNews(page, search, sort),
    staleTime: 60 * 1000,
  });

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  function handleSortChange(value: string | null) {
    setSort(value ?? 'newest');
    setPage(1);
  }

  const newsItems = data?.data ?? [];

  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Warta Halal</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">Berita & Kegiatan</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Kabar terkini dan agenda kegiatan seputar program sertifikasi halal di Sumatera Utara.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Cari judul berita..." className="h-12 rounded-full pl-11" />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="h-12 flex-1 rounded-full px-8 sm:flex-none">
              Cari
            </Button>

            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="h-12 w-full rounded-full sm:w-56">
                <SelectValue>{SORT_OPTIONS.find((o) => o.value === sort)?.label}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        {isLoading ? (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-4/5 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : newsItems.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileQuestion className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">{search ? 'Berita Tidak Ditemukan' : 'Belum Ada Berita'}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{search ? 'Coba ubah kata kunci pencarian anda.' : 'Kabar terkini dan agenda kegiatan halal Sumut akan segera hadir di sini.'}</p>
          </div>
        ) : (
          <>
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {newsItems.map((item) => (
                <Link key={item.id} href={`/berita/${item.slug}`} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={formatContentTitle(item.title)} fill className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-blue-100 text-blue-700 dark:bg-neutral-800 dark:text-blue-300">
                        <Newspaper className="size-10" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2 p-6">
                    {item.publishedAt && <span className="text-xs font-medium text-muted-foreground">{formatDate(item.publishedAt)}</span>}
                    <h3 className="line-clamp-2 text-lg font-bold text-foreground">{formatContentTitle(item.title)}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{stripHtml(item.content)}</p>
                    <div className="mt-auto flex items-center gap-2 pt-3 text-sm font-semibold text-primary">
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="size-4" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-10">
                <PaginationControl page={data.page} totalPages={data.totalPages} totalItems={data.total} pageSize={9} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
