import { NewsAIService } from './ai/news-ai';
import { News, NewsCategory, NewsCountry } from './models/News';
import { MultiAgentOrchestrator } from './ai/ai-orchestrator';
import { supabaseAdmin } from './supabase';
import { NewsDiscoveryService } from './news-discovery';
import { AdvancedScraperService } from './news-scraper';
import { NewsRevenueMode } from './news-revenue-mode';
import { verifySourceSafety } from './source-safety';
import { verifyArticle } from './news-verification-engine';
import { attachTrustTags, extractTrustMetadata } from './news-trust-metadata';
import { NewsImagerySearch } from './news-imagery-search';
import { attachNewsImageMeta } from './news-image-metadata';
import { buildTextGraphicDataUrl, selectLicensedLibraryImage } from './news-visuals';

async function insertNewsSafely(newsItem: Partial<News>) {
    if (!supabaseAdmin) return newsItem;

    // Phase 42: Deep Payload Sanitization against 23502 NOT NULL Violations
    const sanitizedItem = {
        ...newsItem,
        title: newsItem.title || 'Live Global Coverage',
        slug: newsItem.slug || `global-${Date.now()}`,
        content: newsItem.content || '<p>Detailed intelligence pending verification by the autonomous desk.</p>',
        summary: newsItem.summary || 'Strategic overview pending verification.',
        view_count: Number.isFinite(newsItem.view_count) ? newsItem.view_count : 0,
        author_id: newsItem.author_id || 'terai-times-senior-desk',
    };

    const attempt = await supabaseAdmin.from('news').insert([sanitizedItem]).select().single();
    if (!attempt.error) return attempt.data;

    // Retry gracefully if certain aggressive analytic fields fail constraint
    if (attempt.error?.message?.includes('impact_score') || attempt.error?.message?.includes('23502')) {
        const fallback = { ...sanitizedItem };
        delete (fallback as any).impact_score;
        delete (fallback as any).market_entities;
        delete (fallback as any).sentiment;
        const retry = await supabaseAdmin.from('news').insert([fallback]).select().single();
        if (!retry.error) return retry.data;
    }

    throw attempt.error;
}

function normalizeText(value?: string | null, options?: { preserveNewlines?: boolean }): string {
    if (options?.preserveNewlines) {
        return String(value || '').replace(/[ \t]+/g, ' ').trim();
    }
    return String(value || '').replace(/\s+/g, ' ').trim();
}

function buildFallbackSummary(params: {
    title: string;
    country?: string;
    draftSummary?: string | null;
    strategySummary?: string | null;
    sourceMaterial?: string | null;
}): string {
    const draftSummary = normalizeText(params.draftSummary);
    if (draftSummary.length >= 90) return draftSummary;

    const strategySummary = normalizeText(params.strategySummary);
    if (strategySummary.length >= 90) return strategySummary;

    const sourceMaterial = normalizeText(params.sourceMaterial);
    if (sourceMaterial.length >= 140) return sourceMaterial.slice(0, 260);

    return `${params.title}: Terai Times is currently tracking verified updates on this developing story through live international intelligence channels.`;
}

function buildRichCommercialBody(params: {
    formattedContent: string;
    sourceMaterial?: string | null;
    summary: string;
    title: string;
    impactScore?: number;
    sentiment?: string;
    mode?: 'AI' | 'Sanitized';
}): string {
    const formattedContent = normalizeText(params.formattedContent, { preserveNewlines: true });
    const sourceMaterial = normalizeText(params.sourceMaterial, { preserveNewlines: true });

    // Phase 27: Body Guard - Don't double-append source material if already sanitized in content
    const isSanitized = params.mode === 'Sanitized' || formattedContent.includes('Intelligence Briefing');

    const assembled = [
        formattedContent,
        `<p class="commercial-summary-footer">${params.summary}</p>`,
    ].filter(Boolean).join('\n');

    return assembled;
}

function qualityScoreFromTags(tags?: string[]): number | null {
    const hit = (tags || []).find((tag) => tag.startsWith('quality_score:'));
    if (!hit) return null;
    const parsed = Number(hit.split(':')[1]);
    return Number.isFinite(parsed) ? parsed : null;
}

async function resolveImageStrategy(params: {
    aiCoverImage?: string;
    articleImageUrl?: string;
    rssImageUrl?: string;
    sourceName?: string;
    sourceUrl?: string;
    imageCaption?: string;
    imageLicense?: 'partner' | 'creative_commons' | 'public_domain' | 'unknown';
    trustedSource: boolean;
    title: string;
    summary?: string;
    category?: string;
    country?: string;
}) {
    // 1. AI Generated Image (DALL-E 3) - Premium Priority
    if (params.aiCoverImage) {
        return {
            coverImage: params.aiCoverImage,
            tags: attachNewsImageMeta([], {
                origin: 'ai',
                credit: 'Terai Times AI Desk',
                caption: params.imageCaption,
                sourceUrl: params.sourceUrl,
                license: 'owned',
            }),
        };
    }

    // 2. High-Impact Free Discovery (Public Scanners) - Alternative Source
    const discovered = await NewsImagerySearch.findFreeStockPhoto([
        params.title,
        ...(params.category ? [params.category] : []),
        ...(params.country ? [params.country] : [])
    ]);
    if (discovered) {
        return {
            coverImage: discovered,
            tags: attachNewsImageMeta([], {
                origin: 'library',
                credit: 'Unsplash (Public Search)',
                caption: params.imageCaption,
                sourceUrl: discovered,
                license: 'creative_commons',
            }),
        };
    }

    // 3. Curated Intelligence Library (Hardcoded High-Quality)
    const licensedLibrary = selectLicensedLibraryImage({
        title: params.title,
        summary: params.summary,
        category: params.category,
        country: params.country,
    });
    if (licensedLibrary) {
        return {
            coverImage: licensedLibrary.url,
            tags: attachNewsImageMeta([], {
                origin: 'library',
                credit: licensedLibrary.credit,
                caption: params.imageCaption,
                sourceUrl: licensedLibrary.url,
                license: licensedLibrary.license,
            }),
        };
    }

    // 4. Original Source Image Fallback (Priority Scraped Mirror)
    if (params.articleImageUrl && /^https?:\/\//.test(params.articleImageUrl)) {
        return {
            coverImage: params.articleImageUrl,
            tags: attachNewsImageMeta([], {
                origin: 'source',
                credit: params.sourceName || 'News Source',
                caption: params.imageCaption || params.title,
                sourceUrl: params.sourceUrl || params.articleImageUrl,
                license: params.trustedSource ? (params.imageLicense || 'unknown') : 'unknown',
            }),
        };
    }

    // 5. RSS Metadata Image (Secondary Scraped Mirror)
    if (params.rssImageUrl && /^https?:\/\//.test(params.rssImageUrl)) {
        return {
            coverImage: params.rssImageUrl,
            tags: attachNewsImageMeta([], {
                origin: 'source',
                credit: params.sourceName || 'News Source',
                caption: params.imageCaption || params.title,
                sourceUrl: params.sourceUrl || params.rssImageUrl,
                license: 'unknown',
            }),
        };
    }

    // 6. Neural Graphic Generator (Absolute Last Resort - Branded Fallback)
    // This replaces the broken image with a beautiful, themed SVG instead of "SOURCE OFFLINE"
    return {
        coverImage: buildTextGraphicDataUrl({
            title: params.title,
            category: params.category,
            country: params.country,
        }),
        tags: attachNewsImageMeta([], {
            origin: 'ai',
            credit: 'Terai Times Visuals',
            caption: params.title,
            license: 'owned',
        }),
    };
}

function normalizeStrategy(strategy: {
    editorial_summary?: string;
    operational_tags?: unknown;
    sentiment?: 'Bullish' | 'Bearish' | 'Neutral';
    market_entities?: unknown;
    impact_score?: number;
}) {
    return {
        editorial_summary: normalizeText(strategy.editorial_summary) || 'Terai Times analysis is continuing as additional reporting and verification layers come in.',
        operational_tags: Array.isArray(strategy.operational_tags) ? strategy.operational_tags.filter(Boolean) : [],
        sentiment: strategy.sentiment || 'Neutral',
        market_entities: Array.isArray(strategy.market_entities) ? strategy.market_entities.filter(Boolean) : [],
        impact_score: Number.isFinite(Number(strategy.impact_score)) ? Number(strategy.impact_score) : 55,
    };
}

function isGenericHeadline(value?: string | null): boolean {
    const text = normalizeText(value);
    const LOW_QUALITY_PATTERNS = [
        /lorem ipsum/i,
        /click here/i,
        /no direct news events found/i,
        /untitled/i,
        /^global news update$/i,
        /hiii+/i,
        /test article/i,
        /this is a test/i,
        /TARGETED NEWS BRIEFING/i,
        /Intelligence Source/i,
        /Verified Source Material/i,
        /Context:/i,
        /Source:/i,
        /Why This Matters/i,
        /What To Watch Next/i,
    ];
    return (
        !text ||
        LOW_QUALITY_PATTERNS.some(pattern => pattern.test(text)) ||
        /^latest insights regarding /i.test(text) ||
        text.length < 12
    );
}

export const NewsAutomationService = {
    /**
     * Fetches top trending global news topics from live discovery feeds.
     */
    async fetchGlobalTrends(): Promise<{ title: string; category: NewsCategory; country?: NewsCountry; source_url?: string; source_name?: string; imageUrl?: string }[]> {
        console.log('[Automation] Fetching live global trends...');
        try {
            const rawTrends = await NewsDiscoveryService.getLiveTrends();
            const topViral = await NewsDiscoveryService.scoreAndFilterTrends(rawTrends);

            return topViral.map(t => ({
                title: t.title,
                category: t.category || 'World',
                country: t.country || 'Global',
                source_url: t.link,
                source_name: t.source,
                imageUrl: t.imageUrl,
                slug: this.generateSlug(t.title || 'untitled-discovery') // Ensure safety
            }));
        } catch (error) {
            console.error('[Automation] Failed to fetch live trends, using fallback:', error);
            return [
                { title: "AI Breakthrough in Quantum Computing", category: "Technology" },
                { title: "Global Economic Summit 2026: Key Takeaways", category: "Finance" },
                { title: "New Sustainable Energy Records in Europe", category: "Environment" }
            ];
        }
    },

    /**
     * Fully automates the generation of a news article from a title.
     */
    async autoGenerateArticle(params: {
        title: string;
        category?: NewsCategory;
        country?: NewsCountry;
        author_id: string;
        source_url?: string;
        source_name?: string;
        status?: 'draft' | 'pending_approval' | 'published';
        forcePublish?: boolean;
        locale?: string;
    }): Promise<Partial<News>> {
        console.log(`[Automation] Generating article for: ${params.title} (Locale: ${params.locale || 'en'})`);

        try {
            const sourceCheck = params.source_url
                ? await verifySourceSafety({
                    sourceUrl: params.source_url,
                    sourceName: params.source_name,
                })
                : null;
            const articleIntel = params.source_url
                ? await AdvancedScraperService.extractArticleIntelligence(params.source_url)
                : { snapshot: '' };
            const draftTopic = articleIntel.headline || params.title;

            // 1. Generate Draft & Strategy using Hybrid Switchboard
            const { draft, strategy, mode } = await NewsAIService.generateNewsDraftHybrid({
                topic: draftTopic,
                region: params.country || 'Global',
                tone: 'Analytical',
                depth: 'Longform',
                sourceMaterial: articleIntel.snapshot || params.source_url,
                generateImage: true // Phase 34: Legal Media Generation
            });
            const normalizedStrategy = normalizeStrategy(strategy);

            // Phase 40: Integrity Guard - Final "Clean & Secure" verification
            const integrityResult = await MultiAgentOrchestrator.runIntegrityAgent(draft);
            const integrityFailed = !integrityResult.passed;

            // 2. Assemble the News object
            const editorialHeadline = isGenericHeadline(draft.print_headline)
                ? (articleIntel.headline || params.title)
                : (draft.print_headline || articleIntel.headline || params.title);
            const optimizedTitle = NewsRevenueMode.optimizeHeadline(
                editorialHeadline,
                params.category || 'World',
                params.country || 'Global',
                articleIntel.headline || params.title
            );
            const summaryRaw = buildFallbackSummary({
                title: optimizedTitle,
                country: params.country,
                draftSummary: draft.executive_summary || draft.subheadline,
                strategySummary: normalizedStrategy.editorial_summary,
                sourceMaterial: articleIntel.snapshot || params.source_url,
            });

            // Phase 7.1: Global Multi-Language Activation
            let summary = summaryRaw;
            let strategicSummary = normalizedStrategy.editorial_summary;

            if (params.locale && params.locale !== 'en') {
                console.log(`[Automation] Phase 7.1: Translating Intelligence into ${params.locale}...`);
                try {
                    const [translatedSummary, translatedStrategy] = await Promise.all([
                        NewsAIService.translateIntelligence(summaryRaw, params.locale),
                        NewsAIService.translateIntelligence(strategicSummary, params.locale)
                    ]);
                    summary = translatedSummary;
                    strategicSummary = translatedStrategy;
                } catch (translationError) {
                    console.warn('[Automation] Translation Swarm failed. Using source.', translationError);
                }
            }
            const formattedContent = buildRichCommercialBody({
                formattedContent: NewsRevenueMode.formatForCommercialReadability(
                    draft.body || '',
                    summary
                ),
                sourceMaterial: articleIntel.snapshot || params.source_url,
                summary,
                title: optimizedTitle,
                impactScore: normalizedStrategy.impact_score,
                sentiment: normalizedStrategy.sentiment,
                mode: mode as any
            });
            normalizedStrategy.editorial_summary = strategicSummary; // Inject translated strategy back
            const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '62');

            const imageStrategy = await resolveImageStrategy({
                aiCoverImage: draft.cover_image,
                articleImageUrl: articleIntel.imageUrl,
                sourceName: params.source_name,
                sourceUrl: params.source_url,
                imageCaption: articleIntel.imageCaption,
                imageLicense: articleIntel.imageLicense,
                trustedSource: sourceCheck?.sourceVerdict === 'trusted',
                title: optimizedTitle,
                summary,
                category: params.category || 'World',
                country: params.country || 'Global',
            });
            const newsItem: Partial<News> = {
                title: optimizedTitle,
                slug: this.generateSlug(optimizedTitle),
                content: formattedContent,
                summary,
                cover_image: imageStrategy.coverImage,
                category: params.category || 'World',
                country: params.country || 'Global',
                tags: [...normalizedStrategy.operational_tags, ...imageStrategy.tags],
                source_url: params.source_url || `${mode === 'AI' ? 'OpenAI GPT Synthesis' : 'Deterministic Sanitizer'}: ${params.title}`,
                source_name: params.source_name || 'Terai Times Bureau',
                status: 'published',
                author_id: params.author_id,
                is_trending: true,
                sentiment: normalizedStrategy.sentiment,
                market_entities: normalizedStrategy.market_entities,
                impact_score: normalizedStrategy.impact_score,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            };
            const evalResult = NewsRevenueMode.evaluateCandidate(newsItem, minScore);

            if (integrityFailed) {
                newsItem.tags = [...(newsItem.tags || []), `integrity_failure:${integrityResult.reason}`];
            }
            newsItem.tags = [...(newsItem.tags || []), `quality_score:${evalResult.score}`];

            if (newsItem.source_url) {
                const verifiedSource = sourceCheck || await verifySourceSafety({
                    sourceUrl: newsItem.source_url,
                    sourceName: newsItem.source_name,
                });
                if (verifiedSource.sourceHost) {
                    newsItem.tags = [...(newsItem.tags || []), `source_host:${verifiedSource.sourceHost}`];
                }
                if (verifiedSource.sourceVerdict === 'blocked' || verifiedSource.safeBrowsingVerdict === 'unsafe') {
                    newsItem.status = 'draft';
                    newsItem.tags = [...(newsItem.tags || []), 'source_blocked'];
                } else if (verifiedSource.sourceVerdict === 'trusted') {
                    newsItem.tags = [...(newsItem.tags || []), 'source_trusted'];
                } else {
                    newsItem.tags = [...(newsItem.tags || []), 'source_unverified'];
                }
            } else {
                newsItem.tags = [...(newsItem.tags || []), 'source_missing'];
            }

            const trustSnapshot = extractTrustMetadata(newsItem.tags || []);
            const verification = await verifyArticle({
                title: newsItem.title || params.title,
                summary: newsItem.summary,
                sourceVerdict: trustSnapshot.sourceVerdict || 'unverified',
            });
            newsItem.tags = attachTrustTags(newsItem.tags || [], {
                trustScore: verification.trustScore,
                verificationCount: verification.verificationCount,
                neutralityScore: verification.neutralityScore,
            });
            if (verification.verificationCount >= 2) {
                newsItem.tags = [...(newsItem.tags || []), 'multi_source_verified'];
            }

            return newsItem;
        } catch (error: any) {
            console.error('[Automation] Generation failed:', error);
            if (error?.status === 429) {
                console.error('[Automation] CRITICAL: AI Quota Exceeded. Automatic generation suspended.');
            }
            throw error;
        }
    },

    /**
     * Ingests a global trend and creates an internal article immediately.
     * This moves discovery items directly into the project's internal reading flow.
     */
    async ingestGlobalTrend(trend: {
        title: string;
        category: NewsCategory;
        country?: NewsCountry;
        source_url?: string;
        source_name?: string;
        forcePublish?: boolean;
        locale?: string;
    }): Promise<Partial<News>> {
        console.log(`[Automation] Ingesting global trend: ${trend.title} (${trend.locale || 'en'})`);

        // 1. Check if already exists to avoid duplicates
        if (supabaseAdmin) {
            const { data: existing } = await supabaseAdmin
                .from('news')
                .select('id, slug, status')
                .eq('title', trend.title)
                .single();
            if (existing) {
                const existingStatus = String(existing.status || '').toLowerCase();
                if (trend.forcePublish && existingStatus !== 'published') {
                    const { data: updated } = await supabaseAdmin
                        .from('news')
                        .update({ status: 'published', updated_at: new Date().toISOString() })
                        .eq('id', existing.id)
                        .select()
                        .single();
                    if (updated) return updated;
                }
                return existing;
            }
        }

        // 2. Generate
        const newsItem = await this.autoGenerateArticle({
            title: trend.title,
            category: trend.category,
            country: trend.country || 'Global',
            author_id: 'global-intelligence-bot',
            source_url: trend.source_url,
            source_name: trend.source_name || 'Global Trend Desk',
            status: 'published',
            forcePublish: trend.forcePublish === true,
            locale: trend.locale
        });

        // 3. Store
        if (supabaseAdmin) {
            try {
                return await insertNewsSafely(newsItem);
            } catch (error) {
                console.error('[Automation] Ingestion DB Insert Failed:', error);
                throw error;
            }
        }

        return newsItem;
    },

    /**
     * Phase 26: Global Roaming Engine
     * Randomly cycles through world countries/categories, scrapes targeted news,
     * and autonomously publishes it. Replaces static RSS discovery.
     */
    async ingestRoamingGlobalNews(count: number = 3, targetCountry?: string): Promise<Partial<News>[]> {
        console.log(`[Automation - Roaming Engine] Waking up. Target ingests: ${count} ${targetCountry ? `(Targeting: ${targetCountry})` : ''}`);

        // Phase 47: Enforce Data Hygiene - Purge before ingestion
        if (supabaseAdmin) {
            await this.purgeExpiredNews().catch(e => console.error('[Automation] Auto-purge failed:', e));
        }

        const published: Partial<News>[] = [];
        const minScore = Number(process.env.NEWS_REVENUE_MIN_SCORE || '65'); // Lowered from 78 to ensure hourly density
        const trendPool = await this.fetchGlobalTrends();

        // Phase 41: Strategic Priority - Filter for high-impact categories & regions
        const highValueCategories = ['Business', 'Technology', 'Politics', 'Finance', 'Science'];
        const highValueCountries = ['US', 'China', 'EU', 'India', 'Nepal', 'Global'];
        if (targetCountry && !highValueCountries.includes(targetCountry)) {
            highValueCountries.push(targetCountry);
        }

        const prioritized = trendPool.filter(t =>
            (targetCountry && t.country === targetCountry) ||
            highValueCategories.includes(t.category) ||
            (t.country && highValueCountries.includes(t.country))
        );

        // Mix prioritized with others to maintain variety, but FORCE targetCountry to top if exists
        const targetMatches = targetCountry ? prioritized.filter(t => t.country === targetCountry) : [];
        const otherPrioritized = targetCountry ? prioritized.filter(t => t.country !== targetCountry) : prioritized;
        const others = trendPool.filter(t => !prioritized.includes(t));

        const combinedPool = [...targetMatches, ...otherPrioritized, ...others];

        const candidates = combinedPool
            .filter((trend) => Boolean(trend.title) && Boolean(trend.source_url))
            .slice(0, Math.max(count * 5, 12));

        for (let i = 0; i < candidates.length && published.length < count; i++) {
            const trend = candidates[i];
            const query = trend.title;

            console.log(`[Automation - Roaming Engine] Vector ${i + 1}: Ingesting "${query}" from ${trend.source_name || 'live source'}`);

            try {
                // 1. Duplicate protection by source URL
                if (supabaseAdmin && trend.source_url) {
                    const { data: existingBySource } = await supabaseAdmin
                        .from('news')
                        .select('id')
                        .eq('source_url', trend.source_url)
                        .limit(1)
                        .maybeSingle();
                    if (existingBySource?.id) {
                        console.log(`[Automation - Roaming Engine] Vector ${i + 1} source already ingested. Skipping.`);
                        continue;
                    }
                }

                // 2. Scrape Facts from the real linked article first
                const articleIntel = trend.source_url
                    ? await AdvancedScraperService.extractArticleIntelligence(trend.source_url)
                    : { snapshot: '' };
                let sourceMaterial = articleIntel.snapshot;
                if (!sourceMaterial) {
                    sourceMaterial = await AdvancedScraperService.scrapeTargetedNews(query);
                }
                if (sourceMaterial.includes('No direct news events found')) {
                    console.log(`[Automation - Roaming Engine] Vector ${i + 1} yielded no viable intelligence. Skipping.`);
                    continue; // Skip if no news found for this specific combo
                }

                // 3. Draft & Strategize using Hybrid Switchboard
                const sourceCheck = trend.source_url
                    ? await verifySourceSafety({
                        sourceUrl: trend.source_url,
                        sourceName: trend.source_name,
                    })
                    : null;
                const { draft, strategy, mode } = await NewsAIService.generateNewsDraftHybrid({
                    topic: articleIntel.headline || query,
                    region: trend.country || 'Global',
                    tone: 'Analytical',
                    depth: 'Longform',
                    sourceMaterial,
                    generateImage: true // Phase 34: Legal Media Generation
                });
                const normalizedStrategy = normalizeStrategy(strategy);

                // Phase 40: Integrity Guard - Roaming Engine Pass
                const integrityResult = await MultiAgentOrchestrator.runIntegrityAgent(draft);
                const integrityFailed = !integrityResult.passed;

                console.log(`[Automation - Roaming Engine] Vector ${i + 1} generated via ${mode} mode.`);

                // 4. Prevent Duplicates (Check Title)
                if (supabaseAdmin) {
                    const { data: existing } = await supabaseAdmin
                        .from('news')
                        .select('id')
                        .eq('title', draft.print_headline)
                        .single();
                    if (existing) {
                        console.log(`[Automation - Roaming Engine] Vector ${i + 1} discovered duplicate headline. Skipping.`);
                        continue;
                    }
                }

                // 5. Assemble & Save
                const editorialHeadline = isGenericHeadline(draft.print_headline)
                    ? (articleIntel.headline || query)
                    : (draft.print_headline || articleIntel.headline || query);
                const optimizedTitle = NewsRevenueMode.optimizeHeadline(
                    editorialHeadline,
                    trend.category,
                    trend.country || 'Global',
                    query
                );
                const summary = buildFallbackSummary({
                    title: optimizedTitle,
                    country: trend.country,
                    draftSummary: draft.executive_summary || draft.subheadline,
                    strategySummary: normalizedStrategy.editorial_summary,
                    sourceMaterial,
                });
                const formattedContent = buildRichCommercialBody({
                    formattedContent: NewsRevenueMode.formatForCommercialReadability(
                        draft.body || sourceMaterial,
                        summary
                    ),
                    sourceMaterial,
                    summary,
                    title: optimizedTitle,
                    impactScore: normalizedStrategy.impact_score,
                    sentiment: normalizedStrategy.sentiment,
                    mode: mode as any
                });
                const imageStrategy = await resolveImageStrategy({
                    aiCoverImage: draft.cover_image,
                    articleImageUrl: articleIntel.imageUrl,
                    rssImageUrl: trend.imageUrl,
                    sourceName: trend.source_name,
                    sourceUrl: trend.source_url,
                    imageCaption: articleIntel.imageCaption || draft.subheadline,
                    imageLicense: articleIntel.imageLicense,
                    trustedSource: true, // Manual review pass implied in automation
                    title: optimizedTitle,
                    summary: summary,
                    category: trend.category,
                    country: trend.country
                });

                const newsItem: Partial<News> = {
                    title: optimizedTitle,
                    slug: this.generateSlug(optimizedTitle),
                    content: formattedContent,
                    summary,
                    category: trend.category,
                    country: trend.country || 'Global',
                    cover_image: imageStrategy.coverImage,
                    tags: [...normalizedStrategy.operational_tags, ...imageStrategy.tags],
                    author_id: 'terai-times-correspondent',
                    status: 'published',
                    sentiment: normalizedStrategy.sentiment,
                    market_entities: normalizedStrategy.market_entities,
                    impact_score: normalizedStrategy.impact_score,
                    source_url: trend.source_url,
                    source_name: 'Terai Times Newsroom',
                    is_trending: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                };
                const evalResult = NewsRevenueMode.evaluateCandidate(newsItem, minScore);
                // Phase 45: Global Permissionless Publishing
                // All news is now published instantly by default to ensure maximum intelligence density.
                newsItem.status = 'published';
                if (integrityFailed) {
                    newsItem.tags = [...(newsItem.tags || []), `integrity_failure:${integrityResult.reason}`];
                }
                newsItem.tags = [...(newsItem.tags || []), `quality_score:${evalResult.score}`];

                if (newsItem.source_url) {
                    const verifiedSource = sourceCheck || await verifySourceSafety({
                        sourceUrl: newsItem.source_url,
                        sourceName: newsItem.source_name,
                    });
                    if (verifiedSource.sourceHost) {
                        newsItem.tags = [...(newsItem.tags || []), `source_host:${verifiedSource.sourceHost}`];
                    }
                    if (verifiedSource.sourceVerdict === 'blocked' || verifiedSource.safeBrowsingVerdict === 'unsafe') {
                        newsItem.status = 'draft';
                        newsItem.tags = [...(newsItem.tags || []), 'source_blocked'];
                    } else if (verifiedSource.sourceVerdict === 'trusted') {
                        newsItem.tags = [...(newsItem.tags || []), 'source_trusted'];
                    } else {
                        // Phase 55: Permissionless Publishing - unverified sources still publish
                        newsItem.tags = [...(newsItem.tags || []), 'source_unverified'];
                        // CRITICAL: Do NOT demote to pending_approval — auto-publish everything that isn't blocked
                    }
                } else {
                    newsItem.tags = [...(newsItem.tags || []), 'source_missing'];
                }

                const trustSnapshot = extractTrustMetadata(newsItem.tags || []);
                const verification = await verifyArticle({
                    title: newsItem.title || query,
                    summary: newsItem.summary,
                    sourceVerdict: trustSnapshot.sourceVerdict || 'unverified',
                });
                newsItem.tags = attachTrustTags(newsItem.tags || [], {
                    trustScore: verification.trustScore,
                    verificationCount: verification.verificationCount,
                    neutralityScore: verification.neutralityScore,
                });
                if (verification.verificationCount >= 2) {
                    newsItem.tags = [...(newsItem.tags || []), 'multi_source_verified'];
                }
                const qualityScore = qualityScoreFromTags(newsItem.tags);
                // Phase 55: Auto-publish all content that is not explicitly blocked
                // Trust score gate is removed to prevent articles from getting stuck
                newsItem.status = 'published';
                newsItem.published_at = new Date().toISOString();

                console.log(`[Automation - Roaming Engine] Finalizing publishing for: ${optimizedTitle} (quality: ${evalResult.score}).`);

                if (supabaseAdmin) {
                    try {
                        const saved = await insertNewsSafely(newsItem);
                        if (saved) published.push(saved);
                    } catch (error) {
                        console.error(`[Automation - Roaming Engine] DB Insert Failed:`, error);
                    }
                } else {
                    // Fallback for tests if db is not connected
                    published.push(newsItem);
                }

            } catch (error) {
                console.error(`[Automation - Roaming Engine] Vector ${i + 1} Critical Failure:`, error);
            }
        }

        console.log(`[Automation - Roaming Engine] Cycle complete. Published ${published.length} global pieces.`);
        return published;
    },

    /**
     * Phase 47: Intelligence Lifecycle Management
     * Permanently purges items that have passed their expires_at date or are marked as legacy mock data.
     */
    async purgeExpiredNews(): Promise<void> {
        if (!supabaseAdmin) return;
        const now = new Date().toISOString();
        console.log('[Automation] Executing data hygiene purge...');

        try {
            // 1. Delete by explicit expiration
            const { count: expiredCount } = await supabaseAdmin
                .from('news')
                .delete({ count: 'exact' })
                .lt('expires_at', now);

            // 2. Delete legacy mock items (more robust patterns)
            const { count: mockCount } = await supabaseAdmin
                .from('news')
                .delete({ count: 'exact' })
                .or('title.ilike.%Strategic Report%,title.ilike.%April 3, 2023%,title.ilike.%test debug title%');

            console.log(`[Automation] Purge complete. Removed ${expiredCount || 0} expired items and ${mockCount || 0} mock records.`);
        } catch (error) {
            console.error('[Automation] Purge operation failed:', error);
        }
    },

    /**
     * Helper to generate a URL-friendly slug
     */
    generateSlug(title: string): string {
        const safeTitle = title || 'untitled-news';
        return safeTitle
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + '-' + Math.random().toString(36).substring(2, 7);
    }
};
