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
    const category = params.category || 'World';
    const country = params.country || 'All';
    const page = params.page || 1;
    const pageSize = 15;
    const locale = params.locale || 'en';

    // Phase 42: Category Mapping for Live Relays
    // If the category is IPL-Live, we fetch Sports news from the database
    const dbCategory = category === 'IPL-Live' ? 'Sports' : category;

    const [published, totalCount, trending, events, automationStatus, networkAnalytics, filters] = await Promise.all([
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
    const initialEvents = Array.isArray(events) ? events : [];

    // Phase 42.1: Strict Regional Isolation
    // If no news is found for a specific region/category, we no longer fallback to global
    // news to ensure the user's geographic focus is respected.
    if (!initialItems.length && (category !== 'All' || country !== 'All')) {
      // Background ingestion is already triggered below for the missing content
      console.log(`[PublicService] No news found for ${country}/${category}. Dispatching roaming engine...`);
    }

    if (automationStatus.autoPublishEnabled && this.shouldBackfill(initialItems, automationStatus)) {
      // Fire-and-forget background ingestion to keep the landing page fast and resilient
      // If we have a specific country with no items, we prioritize it
      const backfillCountry = (!initialItems.length && country !== 'All') ? country : undefined;
      NewsAutomationService.ingestRoamingGlobalNews(Math.max(1, automationStatus.targetPerHour), backfillCountry)
        .catch(err => console.error('[PublicService] Background ingestion failed:', err));
    }

    // Phase 43: Real-Time AI Translation Relay
    // We unconditionally pass through the translation service to allow the Intelligent English Guard 
    // to catch and translate any leaked foreign content on the English home page.
    try {
      const translateItem = async (item: any) => {
        const [title, summary, category] = await Promise.all([
          translationService.translate(item.title, locale),
          translationService.translate(item.summary || item.content?.slice(0, 150), locale),
          translationService.translate(item.category, locale)
        ]);
        return { ...item, title, summary, category };
      };

      const [translatedItems, translatedTrending, translatedEvents] = await Promise.all([
        Promise.all(initialItems.map(translateItem)),
        Promise.all(initialTrending.map(translateItem)),
        Promise.all(initialEvents.map(async (event: any) => ({
          ...event,
          title: await translationService.translate(event.title, locale),
          description: await translationService.translate(event.description, locale),
        }))),
      ]);

      initialItems = translatedItems;
      initialTrending = translatedTrending;
      // initialEvents = translatedEvents; // We can keep events translated too if needed
    } catch (err) {
      console.error('[PublicService] Content translation failed:', err);
    }

    return {
      category,
      country,
      initialItems,
      initialTrending,
      initialEvents,
      totalCount,
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

      const [automatedRes, pendingRes] = await Promise.all([
        supabaseAdmin
          .from('news')
          .select('id', { count: 'exact', head: true })
          .eq('author_id', 'global-intelligence-bot')
          .gte('created_at', since)
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

  private shouldBackfill(
    initialItems: any[],
    automationStatus: TeraiTimesLandingPayload['automationStatus']
  ): boolean {
    if (!automationStatus.autoPublishEnabled) return false;
    if (!Array.isArray(initialItems) || initialItems.length === 0) return true;

    const latestPublishedAt = initialItems
      .map((item) => new Date(item.published_at || item.created_at || 0).getTime())
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => b - a)[0];

    if (!latestPublishedAt) return true;
    const hoursSinceLatest = (Date.now() - latestPublishedAt) / (1000 * 60 * 60);

    // Goal: At least one news every hour
    return hoursSinceLatest >= 1;
  }
}
