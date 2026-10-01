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

interface EducationDetailPageProps {
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

async function getArticle(slug: string) {
  return prisma.education.findFirst({
    where: { slug, isPublished: true },
    include: { author: { select: { name: true } } },
  });
}

export async function generateMetadata({ params }: EducationDetailPageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return buildMetadata({ path: `/edukasi/${slug}` });
  }

  const excerpt = article.content.replace(/<[^>]*>?/gm, '').slice(0, 160);

  return buildMetadata({
    title: formatContentTitle(article.title),
    description: excerpt,
    path: `/edukasi/${slug}`,
    image: article.thumbnail ?? undefined,
  });
}

export default async function EducationDetailPage({ params }: EducationDetailPageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-10">
      <Link href="/edukasi" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" />
        Kembali ke Edukasi
      </Link>

      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
            {article.author?.name && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  Oleh {toTitleCase(article.author.name)}
                </span>
              </>
            )}
          </div>
          <CopyLinkButton />
        </div>
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">{formatContentTitle(article.title)}</h1>
      </div>

      {article.thumbnail && (
        <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl bg-muted">
          <Image src={article.thumbnail} alt={formatContentTitle(article.title)} fill className="object-cover" />
        </div>
      )}

      <div className="tiptap-editor-content mt-8" dangerouslySetInnerHTML={{ __html: article.content }} />
    </main>
  );
}
