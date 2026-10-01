import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/admin/login', '/lp3h/login', '/lp3h/forgot-password', '/lp3h/reset-password'],
      disallow: ['/admin', '/lp3h', '/umkm/dashboard', '/umkm/profile', '/umkm/products', '/umkm/daftar-mandiri', '/umkm/sertifikasi-gratis', '/umkm/settings', '/api'],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
