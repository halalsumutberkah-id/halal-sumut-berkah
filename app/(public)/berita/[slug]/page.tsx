import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, User } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { formatDate } from '@/lib/utils';
import { toTitleCase } from '@/lib/title-case';
import { CopyLinkButton } from '@/components/public/copy-link-button';

export const revalidate = 60;

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

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

async function getNews(slug: string) {
  return prisma.news.findFirst({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  });
}

export async function generateMetadata({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) {
    return buildMetadata({ path: `/berita/${slug}` });
  }

  const excerpt = news.content.replace(/<[^>]*>?/gm, '').slice(0, 160);

  return buildMetadata({
    title: formatContentTitle(news.title),
    description: excerpt,
    path: `/berita/${slug}`,
    image: news.thumbnail ?? undefined,
  });
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  const { slug } = await params;
  const news = await getNews(slug);

  if (!news) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-10">
      <Link href="/berita" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        Kembali ke Berita & Kegiatan
      </Link>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {news.publishedAt && <span>{formatDate(news.publishedAt)}</span>}
            {news.author?.name && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  Oleh {toTitleCase(news.author.name)}
                </span>
              </>
            )}
          </div>
          <CopyLinkButton />
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">{formatContentTitle(news.title)}</h1>
      </div>

      {news.thumbnail && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
          <Image src={news.thumbnail} alt={formatContentTitle(news.title)} fill className="object-cover" />
        </div>
      )}

      <div className="tiptap-editor-content mt-8" dangerouslySetInnerHTML={{ __html: news.content }} />
    </main>
  );
}
