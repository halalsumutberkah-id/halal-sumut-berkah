import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Building2, MapPin, Phone, Users, ShieldCheck } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { JsonLd } from '@/components/json-ld';
import { toTitleCase } from '@/lib/title-case';
import { CopyLinkButton } from '@/components/public/copy-link-button';

export const revalidate = 60;

interface Lp3hDetailPageProps {
  params: Promise<{ slug: string }>;
}

function formatLp3hName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\blp3h\b/gi, 'LP3H').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

async function getLp3h(slug: string) {
  const lp3h = await prisma.lp3hProfile.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      description: true,
      logoUrl: true,
      pendampings: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true, photoUrl: true, phone: true },
      },
    },
  });

  if (!lp3h) return null;

  const submissions = await prisma.sertifikasiGratisSubmission.findMany({
    where: { lp3hId: lp3h.id },
    select: { umkmId: true },
  });
  const totalUmkmHandled = new Set(submissions.map((s) => s.umkmId)).size;

  return { ...lp3h, totalUmkmHandled };
}

export async function generateMetadata({ params }: Lp3hDetailPageProps) {
  const { slug } = await params;
  const lp3h = await getLp3h(slug);

  if (!lp3h) return buildMetadata({ path: `/lp3h-sumut/${slug}` });

  const formattedName = formatLp3hName(lp3h.name);

  return buildMetadata({
    title: `${formattedName} - LP3H Sumatera Utara`,
    description: lp3h.description ?? `Profil lengkap ${formattedName}, Lembaga Pendamping Proses Produk Halal di Sumatera Utara.`,
    path: `/lp3h-sumut/${slug}`,
    image: lp3h.logoUrl ?? undefined,
  });
}

export default async function Lp3hDetailPage({ params }: Lp3hDetailPageProps) {
  const { slug } = await params;
  const lp3h = await getLp3h(slug);

  if (!lp3h) notFound();

  const formattedName = formatLp3hName(lp3h.name);

  return (
    <main className="flex flex-col">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Beranda', item: siteConfig.url },
            { '@type': 'ListItem', position: 2, name: 'LP3H Sumatera Utara', item: `${siteConfig.url}/lp3h-sumut` },
            { '@type': 'ListItem', position: 3, name: formattedName, item: `${siteConfig.url}/lp3h-sumut/${slug}` },
          ],
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: formattedName,
          image: lp3h.logoUrl ?? undefined,
          description: lp3h.description ?? undefined,
          url: `${siteConfig.url}/lp3h-sumut/${slug}`,
          telephone: lp3h.phone,
          address: {
            '@type': 'PostalAddress',
            streetAddress: toTitleCase(lp3h.address),
            addressCountry: 'ID',
          },
        }}
      />
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <Link href="/lp3h-sumut" className="mb-6 inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground">
            <ArrowLeft className="size-4" />
            Kembali ke Daftar LP3H
          </Link>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10">
              {lp3h.logoUrl ? <Image src={lp3h.logoUrl} alt={lp3h.name} width={80} height={80} className="size-full object-contain p-2" /> : <Building2 className="size-10 text-primary-foreground" />}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">{formattedName}</h1>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="top-36 flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 lg:sticky">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Informasi Lembaga</h3>
                <CopyLinkButton />
              </div>
              {lp3h.description && <p className="text-sm leading-relaxed text-muted-foreground">{lp3h.description}</p>}
              <div className="flex flex-col gap-3 border-t border-border pt-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{toTitleCase(lp3h.address)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <span>{lp3h.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="size-4 shrink-0 text-primary" />
                  <span>{lp3h.pendampings.length} Pendamping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  <span>{lp3h.totalUmkmHandled} UMKM ditangani (Self Declare)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <h2 className="text-lg font-bold text-foreground">Daftar Pendamping ({lp3h.pendampings.length})</h2>

            {lp3h.pendampings.length === 0 ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-12 text-center">
                <p className="text-sm text-muted-foreground">Belum ada Pendamping yang terdaftar.</p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {lp3h.pendampings.map((p) => (
                  <div key={p.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5">
                    <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/60 text-primary">
                      {p.photoUrl ? <Image src={p.photoUrl} alt={p.name} width={56} height={56} className="size-full object-cover" /> : <Users className="size-6" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-foreground">{toTitleCase(p.name)}</p>
                      <p className="text-xs text-muted-foreground">{p.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
