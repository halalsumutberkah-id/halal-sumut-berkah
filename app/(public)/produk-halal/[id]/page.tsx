// app/(public)/produk-halal/[id]/page.tsx

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShieldCheck, Store, Building2, MessageCircle, ImageIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { JsonLd } from '@/components/json-ld';
import { toTitleCase } from '@/lib/title-case';
import { formatRupiah } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyLinkButton } from '@/components/public/copy-link-button';

export const revalidate = 60;

const HALAL_STATUS_LABELS: Record<string, string> = {
  belum_halal: 'Belum Halal',
  proses: 'Proses Sertifikasi',
  halal: 'Halal',
};

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatAcronyms(text: string): string {
  return text
    .replace(/\bumkm\b/gi, 'UMKM')
    .replace(/\blp3h\b/gi, 'LP3H')
    .replace(/\blph\b/gi, 'LPH')
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

function formatTitleCase(text: string | null | undefined): string {
  if (!text) return '';
  return formatAcronyms(toTitleCase(text));
}

function formatSentenceCase(text: string | null | undefined): string {
  if (!text) return '';
  const sentenceCased = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());
  return formatAcronyms(sentenceCased);
}

async function getProduct(id: string) {
  return prisma.product.findFirst({
    where: { id, isPublished: true },
    select: {
      id: true,
      name: true,
      price: true,
      shortDescription: true,
      photoUrl: true,
      halalStatus: true,
      halalCertNumber: true,
      category: { select: { name: true } },
      umkm: {
        select: {
          businessName: true,
          slug: true,
          logoUrl: true,
          businessKabupaten: true,
          businessContactNumber: true,
        },
      },
      publishedLp3h: { select: { name: true, slug: true } },
    },
  });
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return buildMetadata({ path: `/produk-halal/${id}` });

  const productName = formatTitleCase(product.name);
  const categoryName = formatTitleCase(product.category.name);
  const businessName = formatTitleCase(product.umkm.businessName);

  return buildMetadata({
    title: `${productName} - Produk Halal ${categoryName}`,
    description: product.shortDescription?.slice(0, 160) ?? `${productName} dari ${businessName}`,
    path: `/produk-halal/${id}`,
    image: product.photoUrl ?? undefined,
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) notFound();

  const formattedProductName = formatTitleCase(product.name);
  const formattedCategoryName = formatTitleCase(product.category.name);
  const formattedBusinessName = formatTitleCase(product.umkm.businessName);
  const formattedKabupaten = formatTitleCase(product.umkm.businessKabupaten);
  const formattedLp3hName = product.publishedLp3h ? formatTitleCase(product.publishedLp3h.name) : '';
  const formattedShortDescription = formatSentenceCase(product.shortDescription);

  return (
    <main className="min-h-screen bg-background pb-16">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteConfig.url },
            { '@type': 'ListItem', position: 2, name: 'Produk Halal', item: `${siteConfig.url}/produk-halal` },
            { '@type': 'ListItem', position: 3, name: formattedProductName, item: `${siteConfig.url}/produk-halal/${product.id}` },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: formattedProductName,
          image: product.photoUrl ? [product.photoUrl] : undefined,
          description: formattedShortDescription || undefined,
          category: formattedCategoryName,
          brand: { '@type': 'Brand', name: formattedBusinessName },
          offers: {
            '@type': 'Offer',
            url: `${siteConfig.url}/produk-halal/${product.id}`,
            priceCurrency: 'IDR',
            price: product.price,
            availability: 'https://schema.org/InStock',
          },
        }}
      />

      <div className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="mb-6">
          <Link href="/produk-halal" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" />
            Kembali ke Katalog Produk
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl border bg-muted">
                {product.photoUrl ? (
                  <Image src={product.photoUrl} alt={formattedProductName} fill priority sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-muted-foreground/40">
                    <ImageIcon className="size-16" />
                  </div>
                )}

                {product.halalStatus === 'halal' && (
                  <Badge className="absolute left-3 top-3 gap-1 bg-green-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <ShieldCheck className="size-3.5" />
                    {HALAL_STATUS_LABELS[product.halalStatus]}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-7">
            <div className="border-b pb-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs font-medium">
                  {formattedCategoryName}
                </Badge>
                {product.halalCertNumber && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                    <ShieldCheck className="size-3.5 text-green-600 dark:text-green-400" />
                    No. Sertifikat: {product.halalCertNumber}
                  </span>
                )}
              </div>

              <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">{formattedProductName}</h1>

              <p className="mt-4 text-3xl font-extrabold text-primary">{formatRupiah(product.price)}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-xl border bg-card p-4">
                <Link href={`/profil-umkm/${product.umkm.slug}`} className="flex items-center gap-3">
                  <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted/60">
                    {product.umkm.logoUrl ? <Image src={product.umkm.logoUrl} alt={formattedBusinessName} width={48} height={48} className="size-full object-contain p-1" /> : <Store className="size-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-muted-foreground">Diproduksi Oleh</p>
                    <p className="truncate text-sm font-semibold text-foreground hover:underline">{formattedBusinessName}</p>
                    {formattedKabupaten && <p className="truncate text-xs text-muted-foreground">{formattedKabupaten}</p>}
                  </div>
                </Link>

                {product.publishedLp3h && (
                  <div className="mt-3 border-t pt-2.5">
                    <Link href={`/lp3h-sumut/${product.publishedLp3h.slug}`} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary">
                      <Building2 className="size-3.5 shrink-0" />
                      <span className="truncate">Pendamping: {formattedLp3hName}</span>
                    </Link>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center gap-2.5">
                {product.umkm.businessContactNumber && (
                  <Button
                    render={
                      <a
                        href={`https://wa.me/62${product.umkm.businessContactNumber.replace(/^0/, '')}?text=${encodeURIComponent(`Halo, saya ingin pesan produk "${formattedProductName}" yang saya lihat di Halal Sumut Berkah.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="size-4" />
                        Pesan via WhatsApp
                      </a>
                    }
                    nativeButton={false}
                    className="h-11 w-full font-medium"
                  />
                )}
                <CopyLinkButton />
              </div>
            </div>

            <div className="space-y-6 pt-2">
              {product.shortDescription && (
                <div className="rounded-xl border bg-card p-5">
                  <h2 className="text-base font-semibold text-foreground">Deskripsi Produk</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{formattedShortDescription}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
