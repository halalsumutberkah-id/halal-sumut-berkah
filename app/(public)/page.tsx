import { prisma } from '@/lib/prisma';
import { generateMetadata as buildMetadata } from '@/lib/seo';
import { HeroSection } from '@/components/public/sections/hero-section';
import { WakafSection } from '@/components/public/sections/wakaf-section';
import { StatsSection } from '@/components/public/sections/stats-section';
import { SelfDeclarePromoSection } from '@/components/public/sections/self-declare-promo-section';
import { FeaturedProductsSection } from '@/components/public/sections/featured-products-section';
import { LphMitraSection } from '@/components/public/sections/lph-mitra-section';
import { SyaratProsedurPromoSection } from '@/components/public/sections/syarat-prosedur-promo-section';
import { LatestEducationSection } from '@/components/public/sections/latest-education-section';
import { LatestNewsSection } from '@/components/public/sections/latest-news-section';
import { CtaSection } from '@/components/public/sections/cta-section';
import { PromoBannerPopup } from '@/components/public/promo-banner-popup';

export const revalidate = 60;

export const metadata = buildMetadata({ path: '/' });

export default async function LandingPage() {
  const totalUmkm = await prisma.umkmProfile.count();
  const totalProducts = await prisma.product.count({ where: { isPublished: true } });
  const totalLph = await prisma.lp3hProfile.count();
  const totalLphEntity = await prisma.lph.count();

  const featuredProducts = await prisma.product.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true,
      name: true,
      price: true,
      photoUrl: true,
      category: { select: { id: true, name: true } },
      umkm: { select: { businessName: true, businessKabupaten: true, slug: true } },
    },
  });

  const featuredCategories = await prisma.category.findMany({
    take: 3,
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  const lphList = await prisma.lp3hProfile.findMany({
    orderBy: { name: 'asc' },
    take: 3,
    select: {
      id: true,
      name: true,
      slug: true,
      address: true,
      logoUrl: true,
      _count: { select: { pendampings: true } },
    },
  });

  const educationItems = await prisma.education.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, title: true, slug: true, thumbnail: true, content: true, publishedAt: true },
  });

  const newsItems = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: { id: true, title: true, slug: true, thumbnail: true, content: true, publishedAt: true },
  });

  return (
    <>
      <HeroSection />
      <WakafSection />
      <StatsSection totalUmkm={totalUmkm} totalProducts={totalProducts} totalLph={totalLph} />

      <SelfDeclarePromoSection />
      <FeaturedProductsSection products={featuredProducts} categories={featuredCategories} />
      <LphMitraSection lphList={lphList} totalLph={totalLphEntity} />
      <SyaratProsedurPromoSection />

      <LatestEducationSection education={educationItems} />
      {/* <LatestNewsSection news={newsItems} /> */}
      <CtaSection />

      <PromoBannerPopup />
    </>
  );
}
