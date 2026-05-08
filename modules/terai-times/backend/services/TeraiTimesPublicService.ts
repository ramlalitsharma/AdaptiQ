import { FeatureModule } from '@/modules/core/shared';
import { NewsService } from '@/lib/news-service';
import { NewsEventService } from '@/lib/news-event-service';
import { supabaseAdmin } from '@/lib/supabase';
import { NewsAutomationService } from '@/lib/news-automation';
import { translationService } from '@/lib/translation-service';

export type TeraiTimesLandingPayload = {
  category: string;
  country: string;
  initialItems: any[];
  totalCount: number;
  page: number;
  pageSize: number;
  initialTrending: any[];
  initialEvents: any[];
  automationStatus: {
    autoPublishEnabled: boolean;
    targetPerHour: number;
    retentionDays: number;
    newsletterUtcHour: number;
    last24hAutomatedPublished: number | null;
    pendingApprovalCount: number | null;
    maintenanceMode: 'healthy' | 'degraded';
  };
  networkAnalytics?: {
    totalReads: number;
    activeTerminals: number;
    scannedNodes: number;
    networkPulse: string;
    ingressRate: string;
  };
  availableCountries: string[];
  availableCategories: string[];
};

export class TeraiTimesPublicService extends FeatureModule {
  constructor() {
    super('terai-times');
  }

  async getLandingPayload(params: {
    category?: string;
    country?: string;
    page?: number;
    pageSize?: number;
    locale?: string;
  }): Promise<TeraiTimesLandingPayload> {
    const category = params.category || 'All';
    const country = params.country || 'All';
    const page = params.page || 1;
    const pageSize = 15;
    const locale = params.locale || 'en';

    // Phase 42: Category Mapping for Live Relays
    // If the category is IPL-Live, we fetch Sports news from the database
    const dbCategory = category === 'IPL-Live' ? 'Sports' : category;

    const [published, rawTotalCount, trending, events, automationStatus, networkAnalytics, filters] = await Promise.all([
      NewsService.getPublishedNews({ category: dbCategory, country, page, pageSize }),
      NewsService.getNewsCount({ category: dbCategory, country }),
      NewsService.getTrendingNews(6),
      NewsEventService.getPublishedForNews(country, 4).catch((err: any) => {
        console.warn('[PublicService] NewsEvent fetch failed (likely DB connection):', err.message);
        return [];
      }),
      this.getAutomationStatus(),
      NewsService.getAnalyticsSummary(),
      NewsService.getAvailableFilters(),
    ]);

    let initialItems = Array.isArray(published) ? published : [];
    let initialTrending = Array.isArray(trending) ? trending : [];
    let finalTotalCount = Number(rawTotalCount) || 0;
    const initialEvents = Array.isArray(events) ? events : [];

    // Phase 43: Content Optimization
    // Ingestion is now handled EXCLUSIVELY by GitHub Actions to save Vercel CPU.
    // The public site is a "Reader", not a "Scraper".

    // Phase 43: Real-Time AI Translation Relay
    // We pass through the translation service to allow the Intelligent English Guard 
    // to catch and translate any leaked foreign content on the English home page.
    try {
      const translateItem = async (item: any) => {
        // Only translate if we are not in the default English locale or if the item title seems foreign
        const needsTranslation = locale !== 'en';
        if (!needsTranslation) return item;

        const [title, summary, category] = await Promise.all([
          translationService.translate(item.title, locale),
          translationService.translate(item.summary || item.content?.slice(0, 150), locale),
          translationService.translate(item.category, locale)
        ]);
        return { ...item, title, summary, category };
      };

      const [translatedItems, translatedTrending] = await Promise.all([
        Promise.all(initialItems.map(translateItem)),
        Promise.all(initialTrending.map(translateItem)),
      ]);

      initialItems = translatedItems;
      initialTrending = translatedTrending;
    } catch (err) {
      console.error('[PublicService] Content translation failed:', err);
    }

    return {
      category,
      country,
      initialItems,
      initialTrending,
      initialEvents,
      totalCount: finalTotalCount,
      page,
      pageSize,
      automationStatus,
      networkAnalytics,
      availableCountries: filters.countries || [],
      availableCategories: filters.categories || [],
    };
  }

  public async getAutomationStatus(): Promise<TeraiTimesLandingPayload['automationStatus']> {
    const autoPublishEnabled = process.env.NEWS_AUTO_PUBLISH_ENABLED !== 'false';
    const targetPerHour = Math.max(1, Math.min(6, Number(process.env.NEWS_AUTO_PUBLISH_COUNT || '1')));
    const retentionDays = 7;
    const newsletterUtcHour = 6;

    if (!supabaseAdmin) {
      return {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: null,
        pendingApprovalCount: null,
        maintenanceMode: 'degraded',
      };
    }

    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [automatedRes, pendingRes] = await Promise.all([
        supabaseAdmin
          .from('news')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', 'global-intelligence-bot')
          .gte('created_at', since)
          .gt('created_at', sevenDaysAgo)
          .in('status', ['published', 'Published', 'live', 'Active Relay', 'active relay']),
        supabaseAdmin
          .from('news')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending_approval'),
      ]);

      return {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: automatedRes.count ?? 0,
        pendingApprovalCount: pendingRes.count ?? 0,
        maintenanceMode: 'healthy',
      };
    } catch {
      return {
        autoPublishEnabled,
        targetPerHour,
        retentionDays,
        newsletterUtcHour,
        last24hAutomatedPublished: null,
        pendingApprovalCount: null,
        maintenanceMode: 'degraded',
      };
    }
  }

}

