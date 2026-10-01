// app/(public)/produk-halal/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, ListFilter, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toTitleCase } from '@/lib/title-case';
import { formatRupiah } from '@/lib/utils';

interface Category {
  id: string;
  name: string;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  halalStatus: string;
  category: { name: string };
  umkm: { businessName: string; slug: string };
}

const HALAL_STATUS_LABELS: Record<string, string> = {
  belum_halal: 'Belum Halal',
  proses: 'Proses Sertifikasi',
  halal: 'Halal',
};

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/public/categories');
  const data = await res.json();
  return data.data || [];
}

async function fetchProducts(query: string, categoryId: string | null): Promise<ProductItem[]> {
  const params = new URLSearchParams();
  if (query) params.set('search', query);
  if (categoryId) params.set('categoryId', categoryId);

  const res = await fetch(`/api/public/products?${params.toString()}`);
  const data = await res.json();
  return data.data || [];
}

export default function ProdukHalalPage() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // kategori nyaris gak pernah berubah - staleTime panjang biar gak
  // fetch ulang tiap kali halaman ini di-mount
  const { data: categories = [] } = useQuery({
    queryKey: ['public', 'categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000,
  });

  // dulu useEffect + fetch manual tanpa cache sama sekali - sekarang
  // pakai useQuery, kombinasi filter yang sama dalam 1 menit dilayani
  // dari cache tanpa fetch ulang (endpoint publiknya sendiri juga udah
  // di-cache di backend per kombinasi filter)
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['public', 'products', query, selectedCategory],
    queryFn: () => fetchProducts(query, selectedCategory),
    staleTime: 60 * 1000,
  });

  return (
    <main className="flex flex-col">
      <section className="bg-primary py-16 text-primary-foreground sm:py-20">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-10">
          <div className="border-l-4 border-yellow-500 pl-4">
            <span className="text-xs font-bold uppercase tracking-wider text-yellow-300">Direktori</span>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl lg:text-4xl">Katalog Produk Halal Sumatera Utara</h1>
          </div>
          <p className="mt-4 max-w-2xl text-sm text-primary-foreground/85 sm:text-base">Temukan produk-produk UMKM bersertifikat halal dari seluruh Sumatera Utara.</p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-screen-2xl px-4 py-12 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-3 sm:flex-row">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(search);
            }}
            className="relative flex-1"
          >
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari nama produk..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>

          <Popover>
            <PopoverTrigger className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground">
              <ListFilter className="size-4" />
              Kategori
              {selectedCategory && <Badge variant="secondary">1</Badge>}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-2">
              <button onClick={() => setSelectedCategory(null)} className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${!selectedCategory ? 'bg-muted font-medium' : ''}`}>
                Semua Kategori
              </button>
              {categories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${selectedCategory === cat.id ? 'bg-muted font-medium' : ''}`}>
                  {toTitleCase(cat.name)}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">Tidak ada produk yang ditemukan.</p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <Link key={product.id} href={`/produk-halal/${product.id}`} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  {product.photoUrl && <Image src={product.photoUrl} alt={product.name} fill className="object-cover" />}
                  {product.halalStatus === 'halal' && (
                    <Badge className="absolute left-2 top-2 gap-1 bg-green-600">
                      <ShieldCheck className="size-3" />
                      Halal
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {toTitleCase(product.category.name)}
                  </Badge>
                  <h3 className="line-clamp-2 text-sm font-medium text-foreground">{toTitleCase(product.name)}</h3>
                  <p className="text-sm font-semibold text-primary">{formatRupiah(product.price)}</p>
                  <p className="truncate text-xs text-muted-foreground">{toTitleCase(product.umkm.businessName)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
