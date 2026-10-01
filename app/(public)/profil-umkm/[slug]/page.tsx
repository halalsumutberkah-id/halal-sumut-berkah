// app/(public)/profil-umkm/[slug]/page.tsx

import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Store, MapPin, Calendar, Building2, ShieldCheck, PackageOpen, MessageCircle } from 'lucide-react';
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

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  cv: 'CV',
  pt: 'PT',
  koperasi: 'Koperasi',
  perorangan: 'Perorangan',
  lainnya: 'Lainnya',
};

const HALAL_STATUS_LABELS: Record<string, string> = {
  belum_halal: 'Belum Halal',
  proses: 'Proses Sertifikasi',
  halal: 'Halal',
};

interface UmkmProfilePageProps {
  params: Promise<{ slug: string }>;
}

// CATATAN PRIVASI: cuma nampilkan data USAHA (nama, logo, kategori, lokasi
// usaha, tahun berdiri) - data PRIBADI pemilik (nama, NIK, tanggal lahir,
// no HP, alamat pribadi, KTP, NIB) TIDAK PERNAH ditampilkan ke publik
async function getUmkmProfile(slug: string) {
  return prisma.umkmProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      businessName: true,
      logoUrl: true,
      businessType: true,
      establishedYear: true,
      businessAddress: true,
      businessKecamatan: true,
      businessKabupaten: true,
      businessContactNumber: true,
      businessCategory: { select: { name: true } },
      products: {
        where: { isPublished: true },
        select: {
          id: true,
          name: true,
          price: true,
          photoUrl: true,
          halalStatus: true,
          category: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function generateMetadata({ params }: UmkmProfilePageProps) {
  const { slug } = await params;
  const umkm = await getUmkmProfile(slug);

  if (!umkm) return buildMetadata({ path: `/profil-umkm/${slug}` });

  const businessName = toTitleCase(umkm.businessName);

  return buildMetadata({
    title: `${businessName} - Profil UMKM Halal Sumut Berkah`,
    description: `${businessName} adalah UMKM ${toTitleCase(umkm.businessCategory.name)} yang terdaftar di Katalog Halal Sumut Berkah, ${toTitleCase(umkm.businessKabupaten)}.`,
    path: `/profil-umkm/${slug}`,
    image: umkm.logoUrl ?? undefined,
  });
}

export default async function UmkmProfilePage({ params }: UmkmProfilePageProps) {
  const { slug } = await params;
  const umkm = await getUmkmProfile(slug);

  if (!umkm) notFound();

  const businessName = toTitleCase(umkm.businessName);

  return (
    <main className="flex flex-col">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteConfig.url },
            { '@type': 'ListItem', position: 2, name: businessName, item: `${siteConfig.url}/profil-umkm/${slug}` },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: businessName,
          image: umkm.logoUrl ?? undefined,
          url: `${siteConfig.url}/profil-umkm/${slug}`,
          telephone: umkm.businessContactNumber ?? undefined,
          foundingDate: String(umkm.establishedYear),
          address: {
            '@type': 'PostalAddress',
            streetAddress: toTitleCase(umkm.businessAddress),
            addressLocality: toTitleCase(umkm.businessKecamatan),
            addressRegion: toTitleCase(umkm.businessKabupaten),
            addressCountry: 'ID',
          },
        }}
      />
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <Link href="/produk-halal" className="mb-6 inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="size-4" />
            Kembali ke Katalog
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
              {umkm.logoUrl ? <Image src={umkm.logoUrl} alt={businessName} width={80} height={80} className="size-full object-contain p-2" /> : <Store className="size-10 text-primary-foreground" />}
            </div>

            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">{toTitleCase(umkm.businessCategory.name)}</span>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">{businessName}</h1>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="top-36 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 lg:sticky">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Informasi Usaha</h3>
                <CopyLinkButton />
              </div>

              <div className="flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>
                    {toTitleCase(umkm.businessAddress)}, {toTitleCase(umkm.businessKecamatan)}, {toTitleCase(umkm.businessKabupaten)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="size-4 shrink-0 text-primary" />
                  <span>{BUSINESS_TYPE_LABELS[umkm.businessType] ?? toTitleCase(umkm.businessType)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4 shrink-0 text-primary" />
                  <span>Berdiri sejak {umkm.establishedYear}</span>
                </div>
              </div>

              {umkm.businessContactNumber && (
                <Button
                  render={
                    <a
                      href={`https://wa.me/62${umkm.businessContactNumber.replace(/^0/, '')}?text=${encodeURIComponent(`Halo, saya menemukan usaha ${businessName} di Halal Sumut Berkah. Saya ingin bertanya mengenai produk anda.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle className="size-4" />
                      Hubungi via WhatsApp
                    </a>
                  }
                  nativeButton={false}
                  className="w-full justify-center gap-2"
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-8">
            <h2 className="text-lg font-bold text-foreground">Produk yang Dijual ({umkm.products.length})</h2>

            {umkm.products.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <PackageOpen className="size-6" />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Belum ada produk yang dipublikasikan.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {umkm.products.map((product) => (
                  <Link key={product.id} href={`/produk-halal/${product.id}`} className="group flex flex-col gap-2 overflow-hidden rounded-2xl border bg-card">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.photoUrl && <Image src={product.photoUrl} alt={product.name} fill className="object-cover" />}
                      {product.halalStatus === 'halal' && (
                        <Badge className="absolute left-2 top-2 gap-1 text-[10px]">
                          <ShieldCheck className="size-3" />
                          Halal
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 px-3 pb-3">
                      <Badge variant="secondary" className="w-fit text-[10px]">
                        {toTitleCase(product.category.name)}
                      </Badge>
                      <h3 className="line-clamp-2 text-sm font-medium text-foreground">{toTitleCase(product.name)}</h3>
                      <p className="text-sm font-semibold text-primary">{formatRupiah(product.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
