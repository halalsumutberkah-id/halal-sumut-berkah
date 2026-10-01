import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

interface GenerateMetadataOptions {
  title?: string;
  description?: string;
  path?: string; // contoh: "/produk-halal", buat canonical url & og:url
  image?: string;
  noIndex?: boolean; // buat halaman dashboard/private, jangan sampai ke-index Google
}

export function generateMetadata(options: GenerateMetadataOptions = {}): Metadata {
  const title = options.title ?? siteConfig.title;
  const description = options.description ?? siteConfig.description;
  const url = `${siteConfig.url}${options.path ?? ''}`;
  const image = options.image ?? siteConfig.logo;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords],
    authors: [...siteConfig.authors],
    creator: siteConfig.creator,
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    icons: {
      icon: siteConfig.logo,
      shortcut: siteConfig.logo,
      apple: siteConfig.logo,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website',
      images: [{ url: image, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: siteConfig.twitterHandle,
    },
    ...(options.noIndex && {
      robots: { index: false, follow: false },
    }),
  };
}
