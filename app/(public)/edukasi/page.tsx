import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, BookX, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import { toTitleCase } from '@/lib/title-case';

export const revalidate = 60;

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

export async function generateMetadata() {
  const total = await prisma.education.count({ where: { isPublished: true } });

  return buildMetadata({
    title: 'Edukasi Halal',
    description: `${total} artikel edukasi seputar sertifikasi halal, proses produksi, dan literasi halal untuk pelaku UMKM di Sumatera Utara.`,
    path: '/edukasi',
  });
}

function stripHtml(html: string) {
  return html
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default async function EdukasiPage() {
  const articles = await prisma.education.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      thumbnail: true,
      content: true,
      publishedAt: true,
    },
  });

  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Pusat Literasi</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">Edukasi Halal</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Panduan dan wawasan seputar sertifikasi halal untuk membantu UMKM memahami proses dan manfaatnya.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <BookX className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Belum Ada Materi Edukasi</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Materi edukasi dan panduan halal terbaru akan segera dipublikasikan di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link key={article.id} href={`/edukasi/${article.slug}`} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  {article.thumbnail ? (
                    <Image src={article.thumbnail} alt={formatContentTitle(article.title)} fill className="object-cover" />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-blue-50 text-blue-700 dark:bg-neutral-800 dark:text-blue-300">
                      <BookOpen className="size-10" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-6">
                  {article.publishedAt && <span className="text-xs font-medium text-muted-foreground">{formatDate(article.publishedAt)}</span>}
                  <h3 className="line-clamp-2 text-lg font-bold text-foreground">{formatContentTitle(article.title)}</h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{stripHtml(article.content)}</p>
                  <div className="mt-auto flex items-center gap-2 pt-3 text-sm font-semibold text-primary">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
