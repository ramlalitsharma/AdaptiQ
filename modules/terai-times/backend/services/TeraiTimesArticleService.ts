import { FeatureModule } from '@/modules/core/shared';
import { NewsService } from '@/lib/news-service';
import { getNewsAuthorById } from '@/lib/news-authors';
import { translationService } from '@/lib/translation-service';

export class TeraiTimesArticleService extends FeatureModule {
  constructor() {
    super('terai-times-article');
  }

  async getArticleBySlug(slug: string) {
    return NewsService.getNewsBySlug(slug);
  }

  async getTrending(limit = 8) {
    return NewsService.getTrendingNews(limit);
  }

  async getAuthor(authorId?: string) {
    if (!authorId) {
      return { authorId: 'system', name: 'Refectl Intelligence Agency', role: 'News Desk' } as any;
    }
    return getNewsAuthorById(authorId);
  }

  async getDetailPayload(slug: string, locale: string = 'en') {
    const rawNews = await this.getArticleBySlug(slug);
    if (!rawNews) return { news: null, author: null, related: [], engagement: null };

    // Async increment view count for analytics
    NewsService.incrementViewCount(slug).catch(err => console.error('Tracker error:', err));

    // Phase 62: Deep Linguistic Translation Interception
    // Forcefully translate the article core before it hits the UI
    let news = { ...rawNews };
    try {
        news.title = await translationService.translate(rawNews.title, locale);
        news.summary = await translationService.translate(rawNews.summary, locale);
        if (rawNews.content) {
            news.content = await translationService.translate(rawNews.content, locale);
        }
    } catch (e) {
        console.error('[ArticleService] Deep translation failed:', e);
    }

    // Modular parallel fetching for the Engagement Hub
    const [trendingNews, recentNews, popularCategories, popularCountries, author, networkAnalytics] = await Promise.all([
      NewsService.getTrendingNews(4),
      NewsService.getRecentNews(4),
      NewsService.getPopularCategories(5),
      NewsService.getPopularCountries(5),
      this.getAuthor(news.author_id || 'system'),
      NewsService.getAnalyticsSummary(),
    ]);

    const related = (Array.isArray(trendingNews) ? trendingNews : []).filter((n: any) => n.id !== news.id);

    const engagement = {
      popular: trendingNews.filter((n: any) => n.id !== news.id).slice(0, 3),
      recent: recentNews.filter((n: any) => n.id !== news.id).slice(0, 3),
      categories: popularCategories,
      countries: popularCountries,
      networkAnalytics // Secure analytics for the detail page
    };

    return { news, author, related, engagement };
  }
}

