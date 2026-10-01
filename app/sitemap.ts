import type { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { siteConfig } from '@/lib/site-config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: 'daily', priority: 1 },
    { url: `${siteConfig.url}/produk-halal`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteConfig.url}/lp3h-sumut`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteConfig.url}/lph-sumut`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteConfig.url}/edukasi`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteConfig.url}/berita`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteConfig.url}/syarat-prosedur`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteConfig.url}/tentang-kami`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteConfig.url}/kebijakan-privasi`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${siteConfig.url}/syarat-ketentuan`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const lp3hList = await prisma.lp3hProfile.findMany({
    select: { slug: true, updatedAt: true },
  });

  const umkmList = await prisma.umkmProfile.findMany({
    select: { slug: true, updatedAt: true },
  });

  const products = await prisma.product.findMany({
    where: { isPublished: true },
    select: { id: true, updatedAt: true },
  });

  const educationArticles = await prisma.education.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const newsItems = await prisma.news.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const lp3hPages: MetadataRoute.Sitemap = lp3hList.map((lp3h) => ({
    url: `${siteConfig.url}/lp3h-sumut/${lp3h.slug}`,
    lastModified: lp3h.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const umkmPages: MetadataRoute.Sitemap = umkmList.map((umkm) => ({
    url: `${siteConfig.url}/profil-umkm/${umkm.slug}`,
    lastModified: umkm.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${siteConfig.url}/produk-halal/${product.id}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  const educationPages: MetadataRoute.Sitemap = educationArticles.map((article) => ({
    url: `${siteConfig.url}/edukasi/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const newsPages: MetadataRoute.Sitemap = newsItems.map((news) => ({
    url: `${siteConfig.url}/berita/${news.slug}`,
    lastModified: news.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...lp3hPages, ...umkmPages, ...productPages, ...educationPages, ...newsPages];
}
