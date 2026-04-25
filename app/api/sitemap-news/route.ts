import { MetadataRoute } from 'next';
import { NewsService } from '@/lib/news-service';
import { locales } from '@/lib/navigation';

/**
 * Phase 60: Google News Global Dominance
 * Generates a specialized news sitemap for Google News indexing.
 * Requirements: Last 2 days of news, specific <news:news> tags.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.refectl.com';
  const newsItems = await NewsService.getPublishedNews();
  
  // Google News only wants articles from the last 2 days
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const recentNews = newsItems.filter(item => 
    new Date(item.published_at || item.created_at) >= fortyEightHoursAgo
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  ${recentNews.flatMap(item => 
    locales.map(locale => `
  <url>
    <loc>${baseUrl}/${locale}/news/${item.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Terai Times</news:name>
        <news:language>${locale}</news:language>
      </news:publication>
      <news:publication_date>${new Date(item.published_at || item.created_at).toISOString()}</news:publication_date>
      <news:title>${item.title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</news:title>
    </news:news>
  </url>`).join('')
  ).join('')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=5900'
    }
  });
}
