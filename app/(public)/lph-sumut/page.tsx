import { Landmark, MapPin, Phone, ShieldCheck, Calendar, Layers, MessageSquare } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { toTitleCase } from '@/lib/title-case';

export const revalidate = 60;

export async function generateMetadata() {
  const total = await prisma.lph.count();

  return buildMetadata({
    title: 'LPH Sumatera Utara',
    description: `${total} Lembaga Pemeriksa Halal (LPH) resmi yang tersebar di Sumatera Utara.`,
    path: '/lph-sumut',
  });
}

function formatDate(date: Date | null) {
  if (!date) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

function formatLphName(name: string) {
  const titleCased = toTitleCase(name);
  return titleCased.replace(/\(([^)]+)\)/g, (_, match) => `(${match.toUpperCase()})`);
}

export default async function LphDirectoryPage() {
  const lphList = await prisma.lph.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="max-w-3xl">
            <div className="border-l-4 border-yellow-500 pl-4">
              <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Lembaga Resmi</span>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">LPH Sumatera Utara</h1>
            </div>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/85 sm:text-lg">Lembaga Pemeriksa Halal (LPH) resmi yang bertugas melakukan audit dan pemeriksaan kehalalan produk di Sumatera Utara.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-16 sm:px-6 lg:px-10">
        {lphList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Landmark className="size-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-foreground">Belum Ada LPH Terdaftar</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lphList.map((lph) => (
              <div key={lph.id} className="flex flex-col justify-between gap-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Landmark className="size-6" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-foreground">{formatLphName(lph.name)}</h3>
                    {lph.description && <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{lph.description}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5 rounded-lg bg-muted/40 p-3 text-xs">
                    {lph.registrationNumberBpjph && (
                      <div className="flex items-center gap-2 text-foreground/80">
                        <ShieldCheck className="size-3.5 shrink-0 text-primary" />
                        <span>No. Reg: {lph.registrationNumberBpjph}</span>
                      </div>
                    )}
                    {lph.skValidUntil && (
                      <div className="flex items-center gap-2 text-foreground/80">
                        <Calendar className="size-3.5 shrink-0 text-primary" />
                        <span>SK Berlaku: {formatDate(lph.skValidUntil)}</span>
                      </div>
                    )}
                    {lph.inspectionScope && (
                      <div className="flex items-start gap-2 text-foreground/80">
                        <Layers className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>Lingkup: {lph.inspectionScope}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    <span>
                      {toTitleCase(lph.address)}, {toTitleCase(lph.kabupaten)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{lph.phone}</span>
                  </div>
                  {lph.contactWhatsapp && (
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="size-3.5 shrink-0" />
                      <span>WA: {lph.contactWhatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
