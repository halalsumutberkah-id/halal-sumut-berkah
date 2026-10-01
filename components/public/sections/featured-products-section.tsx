'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, MapPin, PackageOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toTitleCase } from '@/lib/title-case';
import { formatRupiah } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  categoryId?: string;
  category: { id?: string; name: string; slug?: string };
  umkm: { businessName: string; businessKabupaten: string };
}

interface FeaturedCategory {
  id: string;
  name: string;
  slug?: string;
}

interface FeaturedProductsSectionProps {
  products: FeaturedProduct[];
  categories?: FeaturedCategory[];
}

const DISPLAY_COUNT = 8;
const ARROW_THRESHOLD = 5;
const MAX_TOP_CATEGORIES = 4;

function formatText(text: string | null | undefined): string {
  if (!text) return '';
  const titleCased = toTitleCase(text);
  return titleCased
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

export function FeaturedProductsSection({ products = [] }: FeaturedProductsSectionProps) {
  const [activeTab, setActiveTab] = useState<string>('semua');
  const trackRef = useRef<HTMLDivElement>(null);

  const { topCategories, hasOthers, topCategoryIds } = useMemo(() => {
    const map = new Map<string, string>();

    products.forEach((p) => {
      const id = p.category?.id || p.categoryId || p.category?.name;
      const name = p.category?.name;
      if (id && name && !map.has(id)) {
        map.set(id, name);
      }
    });

    const allCats = Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    const top = allCats.slice(0, MAX_TOP_CATEGORIES);
    const others = allCats.length > MAX_TOP_CATEGORIES;
    const topIds = new Set(top.map((c) => c.id));

    return {
      topCategories: top,
      hasOthers: others,
      topCategoryIds: topIds,
    };
  }, [products]);

  const tabs = useMemo(() => {
    const baseTabs = [{ id: 'semua', name: 'Semua' }, ...topCategories];
    if (hasOthers) {
      baseTabs.push({ id: 'lainnya', name: 'Lainnya' });
    }
    return baseTabs;
  }, [topCategories, hasOthers]);

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];

    if (activeTab === 'semua') {
      return products.slice(0, DISPLAY_COUNT);
    }

    if (activeTab === 'lainnya') {
      return products
        .filter((p) => {
          const catId = p.category?.id || p.categoryId || p.category?.name;
          return !catId || !topCategoryIds.has(catId);
        })
        .slice(0, DISPLAY_COUNT);
    }

    return products
      .filter((p) => {
        const catId = p.category?.id || p.categoryId;
        const catName = p.category?.name;
        return catId === activeTab || catName === activeTab;
      })
      .slice(0, DISPLAY_COUNT);
  }, [products, activeTab, topCategoryIds]);

  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.scrollTo({ left: 0 });
    }
  }, [activeTab]);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('[data-card]') as HTMLElement | null;
    const amount = card ? card.offsetWidth + 16 : track.clientWidth * 0.8;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  const showArrows = filteredProducts.length > ARROW_THRESHOLD;

  return (
    <section className="mx-auto max-w-screen-2xl px-4 py-8 sm:px-6 lg:px-10">
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="border-l-4 border-yellow-500 pl-4">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Produk Halal Unggulan UMKM</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" render={<Link href="/umkm/register">Daftarkan Produk Anda</Link>} nativeButton={false} className="h-auto rounded-full px-5 py-2 text-sm font-medium" />
            <Button
              render={
                <Link href="/produk-halal">
                  Lihat Semua
                  <ArrowRight className="size-4" />
                </Link>
              }
              nativeButton={false}
              className="h-auto rounded-full px-5 py-2 text-sm font-medium"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn('shrink-0 rounded-full px-4 py-2 text-sm font-medium cursor-pointer', activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}
            >
              {formatText(tab.name)}
            </button>
          ))}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="mt-8 flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <PackageOpen className="size-6" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Belum ada produk pada kategori ini.</p>
          </div>
        ) : (
          <div className="relative mt-6 flex flex-1 items-center">
            {showArrows && (
              <button
                type="button"
                onClick={() => scrollByCard(-1)}
                className="absolute left-0 top-1/2 z-10 hidden size-9 -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm xl:flex cursor-pointer"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </button>
            )}

            <div ref={trackRef} className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
              {filteredProducts.map((product) => {
                const formattedName = formatText(product.name);
                const formattedCategory = formatText(product.category?.name);
                const formattedBusinessName = formatText(product.umkm?.businessName);
                const formattedKabupaten = formatText(product.umkm?.businessKabupaten);

                return (
                  <Link key={product.id} href={`/produk-halal/${product.id}`} data-card className="flex w-[46%] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-background sm:w-[31%] lg:w-[23%] xl:w-[18.5%]">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      {product.photoUrl && <Image src={product.photoUrl} alt={formattedName} fill sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 20vw" className="object-cover" />}
                      {formattedCategory && <Badge className="absolute left-2.5 top-2.5 border-0 bg-amber-500 text-[10px] font-semibold text-white shadow-xs">{formattedCategory}</Badge>}
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-3">
                      <h3 className="line-clamp-2 text-sm font-medium text-foreground">{formattedName}</h3>
                      <p className="text-sm font-semibold text-primary">{formatRupiah(product.price)}</p>
                      <p className="truncate text-xs text-muted-foreground">{formattedBusinessName}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{formattedKabupaten}</span>
                      </div>

                      <div className="mt-auto flex items-center gap-1 pt-2 text-xs font-semibold text-primary">
                        Lihat Detail
                        <ArrowRight className="size-3" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {showArrows && (
              <button
                type="button"
                onClick={() => scrollByCard(1)}
                className="absolute right-0 top-1/2 z-10 hidden size-9 -translate-y-1/2 translate-x-3 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm xl:flex cursor-pointer"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
