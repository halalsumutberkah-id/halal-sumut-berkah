import Image from 'next/image';
import Link from 'next/link';
import { Building2, MapPin, Phone, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { toTitleCase } from '@/lib/title-case';

export const revalidate = 60;

export async function generateMetadata() {
  const total = await prisma.lp3hProfile.count();

  return buildMetadata({
    title: 'LP3H Sumatera Utara',
    description: `${total} Lembaga Pendamping Proses Produk Halal (LP3H) resmi yang mendampingi UMKM mengurus sertifikasi halal di seluruh Sumatera Utara.`,
    path: '/lp3h-sumut',
  });
}

function formatLp3hName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\blp3h\b/gi, 'LP3H').replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

export default async function Lp3hSumutPage() {
  const lp3hList = await prisma.lp3hProfile.findMany({
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      phone: true,
      description: true,
      logoUrl: true,
      _count: { select: { pendampings: true } },
    },
  });

  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Lembaga Resmi</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">LP3H Sumatera Utara</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Lembaga Pendamping Proses Produk Halal (LP3H) resmi yang mendampingi UMKM mengurus sertifikasi halal di seluruh Sumatera Utara.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="top-36 flex flex-col gap-3 lg:sticky">
              <div className="border-l-4 border-yellow-500 pl-4">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Lembaga Terverifikasi</span>
                <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{lp3hList.length} LP3H Terdaftar</h2>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">Klik salah satu LP3H untuk melihat profil lengkap beserta daftar Pendamping yang tersedia.</p>
            </div>
          </div>

          <div className="lg:col-span-8">
            {lp3hList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Building2 className="size-7" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">Belum Ada LP3H Terdaftar</h3>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Daftar Lembaga Pendamping Proses Produk Halal akan segera ditampilkan di sini.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {lp3hList.map((lp3h) => (
                  <Link key={lp3h.id} href={`/lp3h-sumut/${lp3h.slug}`} className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-sm sm:flex-row sm:p-7">
                    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/60 text-primary">
                      {lp3h.logoUrl ? <Image src={lp3h.logoUrl} alt={lp3h.name} width={64} height={64} className="size-full object-contain p-2" /> : <Building2 className="size-8" />}
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div>
                        <h3 className="text-base font-bold text-foreground sm:text-lg">{formatLp3hName(lp3h.name)}</h3>
                        {lp3h.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{lp3h.description}</p>}
                      </div>

                      <div className="flex flex-col gap-2 border-t border-border pt-3 text-xs text-muted-foreground sm:text-sm">
                        <div className="flex items-center gap-1.5 font-semibold text-primary">
                          <Users className="size-3.5 shrink-0" />
                          <span>{lp3h._count.pendampings} Pendamping</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="mt-0.5 size-3.5 shrink-0" />
                          <span>{toTitleCase(lp3h.address)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="size-3.5 shrink-0" />
                          <span>{lp3h.phone}</span>
                        </div>
                      </div>
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
