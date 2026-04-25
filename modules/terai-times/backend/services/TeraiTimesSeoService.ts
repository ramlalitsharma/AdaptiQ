import type { Metadata } from 'next';
import { BRAND_URL } from '@/lib/brand';
import { locales } from '@/lib/navigation';
import { SeoModule } from '@/modules/core/shared';
import { TeraiTimesArticleService } from './TeraiTimesArticleService';

export class TeraiTimesSeoService extends SeoModule {
  private readonly articleService = new TeraiTimesArticleService();

  constructor() {
    super('terai-times-seo');
  }

  async buildPageMetadata(params: Record<string, any> & { locale?: string }): Promise<Metadata> {
    const category = this.normalizeFilter(params?.category as string | undefined);
    const country = this.normalizeFilter(params?.country as string | undefined);
    const locale = (params?.locale as string) || 'en';
    const canonicalUrl = `${BRAND_URL}/${locale}/news`;

    const title =
      category !== 'All'
        ? `${category} News | Online News & Live Reports | Terai Times` 
        : country !== 'All'
          ? `${country} Breaking News | Online World News | Terai Times` 
          : 'Terai Times | Online News, Live Breaking Reports & World Intelligence';

    const description =
      category !== 'All'
        ? `Access real-time ${category} news, online reports, and strategic intelligence from the Terai Times Global Desk. Live updates 24/7.`
        : country !== 'All'
          ? `Breaking ${country} news and live online reports. Get verified world intelligence and regional updates from Terai Times.`
          : 'Terai Times is your premier source for online news, live breaking reports, and world intelligence. Stay ahead with our high-fidelity global news feed.';

    const keywords = [
      'Terai Times',
      'Online News',
      'Breaking News',
      'Live News',
      'World News',
      'Global Intelligence',
      'Live Reports',
      'News Today',
      category !== 'All' ? `${category.toLowerCase()} online news` : null,
      country !== 'All' ? `${country.toLowerCase()} breaking news` : null,
    ].filter(Boolean) as string[];

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: canonicalUrl,
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BRAND_URL}/${l}/news`])
        ),
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: 'website',
        siteName: 'Terai Times',
        images: [
          {
            url: `${BRAND_URL}/og-news.png`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${BRAND_URL}/og-news.png`],
      },
    };
  }

  async buildArticleMetadata(slug: string, locale: string = 'en'): Promise<Metadata> {
    try {
      const news = await this.articleService.getArticleBySlug(slug);
      if (!news) return { title: 'Intelligence Not Found' };
      const author = await this.articleService.getAuthor(news.author_id || 'system');
      const publishedDate = news.published_at || news.created_at;
      const imageUrl = news.cover_image || `${BRAND_URL}/og-news.png`;

      return {
        title: `${news.title} | Terai Times News`,
        description: news.summary,
        alternates: {
          canonical: `${BRAND_URL}/${locale}/news/${slug}`,
          languages: Object.fromEntries(
            locales.map((l) => [l, `${BRAND_URL}/${l}/news/${slug}`])
          ),
        },
        openGraph: {
          title: news.title,
          description: news.summary,
          url: `${BRAND_URL}/${locale}/news/${slug}`,
          type: 'article',
          publishedTime: publishedDate,
          authors: [author.name || 'Refectl Intelligence Agency'],
          siteName: 'Terai Times',
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: news.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: news.title,
          description: news.summary,
          images: [imageUrl],
        },
      };
    } catch {
      return { title: 'Terai Times News' };
    }
  }

  /**
   * Generates NewsArticle JSON-LD for Search Engines
   */
  async getArticleSchema(slug: string, locale: string = 'en') {
    try {
      const news = await this.articleService.getArticleBySlug(slug);
      if (!news) return null;
      const author = await this.articleService.getAuthor(news.author_id || 'system');
      const publishedDate = news.published_at || news.created_at;

      return {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: news.title,
        description: news.summary,
        image: [news.cover_image].filter(Boolean),
        datePublished: publishedDate,
        dateModified: news.updated_at || publishedDate,
        author: [
          {
            '@type': 'Person',
            name: author.name || 'Terai Times Intelligence Bot',
            url: `${BRAND_URL}/${locale}/news/author/${author.id || 'system'}`,
          },
        ],
        publisher: {
          '@type': 'NewsMediaOrganization',
          name: 'Terai Times',
          legalName: 'Terai Times Global Intelligence',
          alternateName: ['TT News', 'Terai Online News'],
          url: `${BRAND_URL}/${locale}/news`,
          logo: {
            '@type': 'ImageObject',
            url: `${BRAND_URL}/logo-premium.png`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${BRAND_URL}/${locale}/news/${slug}`,
        },
      };
    } catch {
      return null;
    }
  }

  /**
   * Generates CollectionPage JSON-LD for the News Landing
   */
  getLandingSchema(locale: string = 'en') {
    return {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Terai Times | Online News & Global Intelligence Desk',
      description: 'The definitive source for real-time online news, live breaking reports, and strategic world intelligence.',
      url: `${BRAND_URL}/${locale}/news`,
      publisher: {
        '@type': 'NewsMediaOrganization',
        name: 'Terai Times',
        legalName: 'Terai Times Global Intelligence',
        url: `${BRAND_URL}/${locale}/news`,
        logo: {
          '@type': 'ImageObject',
          url: `${BRAND_URL}/logo-premium.png`,
        },
      },
    };
  }
}
