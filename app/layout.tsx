// app/layout.tsx

import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/next';
import { generateMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';
import { JsonLd } from '@/components/json-ld';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

// pakai title.default + title.template biar tiap halaman bisa set title sendiri
// (misal "Produk Halal") dan otomatis jadi "Produk Halal | halalsumutberkah.id"
export const metadata: Metadata = {
  ...generateMetadata(),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
};

// WAJIB ADA - tanpa ini, browser HP nge-render halaman di lebar desktop
// (~980px) lalu di-zoom-out paksa biar muat ke layar kecil, bikin semua
// terlihat "kegedean" dan ke-crop
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className={cn('h-full', 'antialiased', 'font-sans', inter.variable)}>
      <body className="min-h-full flex flex-col">
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'GovernmentOrganization',
            name: siteConfig.title,
            alternateName: siteConfig.name,
            url: siteConfig.url,
            logo: `${siteConfig.url}${siteConfig.logo}`,
            description: siteConfig.description,
            areaServed: {
              '@type': 'State',
              name: 'Sumatera Utara',
            },
          }}
        />
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster richColors position="top-center" />
          </TooltipProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
