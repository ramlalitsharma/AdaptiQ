import type { Metadata } from 'next';
import {
  NewsLandingPage,
  generateNewsLandingMetadata,
} from '@/modules/terai-times/frontend/public';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, any>>;
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return generateNewsLandingMetadata({ searchParams, locale });
}

export default async function NewsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<Record<string, any>>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <NewsLandingPage searchParams={searchParams} locale={locale} />;
}
