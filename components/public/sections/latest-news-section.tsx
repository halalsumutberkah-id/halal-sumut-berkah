import Link from 'next/link';
import Image from 'next/image';
import { Newspaper, ArrowRight, FileQuestion } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toTitleCase } from '@/lib/title-case';

export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  thumbnail: string | null;
  content: string;
  publishedAt?: string | Date | null;
}

interface LatestNewsSectionProps {
  news?: NewsItem[];
}

function stripHtml(html: string) {
  return html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function LatestNewsSection({ news = [] }: LatestNewsSectionProps) {
  return (
    <section className="bg-blue-50 dark:bg-neutral-800">
      <div className="mx-auto max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="border-l-4 border-yellow-500 pl-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Berita & Kegiatan</span>
            <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Berita & Kegiatan Terbaru</h2>
          </div>

          {news.length > 0 && (
            <Button
              variant="outline"
              render={
                <Link href="/berita">
                  Lihat Semua Berita
                  <ArrowRight className="size-4" />
                </Link>
              }
              nativeButton={false}
              className="h-auto w-fit rounded-full border-border bg-card px-6 py-3 font-medium text-foreground hover:bg-muted"
            />
          )}
        </div>

        {news.length === 0 ? (
          <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <FileQuestion className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Belum Ada Berita</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Kabar terkini dan agenda kegiatan halal Sumut akan segera hadir di sini.</p>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.slice(0, 3).map((item) => (
              <Link key={item.id} href={`/berita/${item.slug}`} className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex flex-col">
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {item.thumbnail ? (
                      <Image src={item.thumbnail} alt={toTitleCase(item.title)} fill className="object-cover" />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-blue-100 text-blue-700 dark:bg-neutral-800 dark:text-blue-300">
                        <Newspaper className="size-10" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 p-6">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Warta Halal</span>
                    <h3 className="line-clamp-2 text-lg font-bold text-foreground">{toTitleCase(item.title)}</h3>
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{stripHtml(item.content)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 border-t border-border px-6 py-4 text-sm font-semibold text-blue-700 dark:text-blue-300">
                  <span>Baca Selengkapnya</span>
                  <ArrowRight className="size-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
