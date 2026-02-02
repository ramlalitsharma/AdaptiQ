import { Metadata } from 'next';
import { NewsService } from '@/lib/news-service';
import { format } from 'date-fns';
import { TrendingUp, Clock, Grid, ArrowRight, Newspaper, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AnimatedList, AnimatedItem } from '@/components/ui/AnimatedCard';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { BRAND_URL } from '@/lib/brand';
import { NewsImage } from '@/components/news/NewsImage';
import { supabase, supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, any>> }): Promise<Metadata> {
    const resolvedParams = await searchParams;
    const category = (resolvedParams?.category as string) || 'All';
    const country = (resolvedParams?.country as string) || 'All';

    const title = category !== 'All'
        ? `${category} News | Terai Times`
        : country !== 'All'
            ? `${country} News | Terai Times`
            : 'Terai Times News | Global Intelligence & Market Pulse';

    const description = category !== 'All'
        ? `Latest ${category} news, analysis, and insights from Terai Times by Refectl Intelligence Agency.`
        : country !== 'All'
            ? `Breaking news and updates from ${country} - comprehensive coverage by Terai Times.`
            : 'World-class news coverage, global market intelligence, and deep-dive analysis from Terai Times News by Refectl.';

    return {
        title,
        description,
        alternates: {
            canonical: `${BRAND_URL}/news${category !== 'All' ? `?category=${category}` : ''}${country !== 'All' ? `?country=${country}` : ''}`,
        },
        openGraph: {
            title,
            description,
            url: `${BRAND_URL}/news`,
            type: 'website',
            siteName: 'Terai Times',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    };
}

export default async function NewsPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, any>>;
}) {
    const resolvedParams = await searchParams;
    const selectedCategory = (resolvedParams?.category as string) || 'All';
    const selectedCountry = (resolvedParams?.country as string) || 'All';

    let newsItems: Awaited<ReturnType<typeof NewsService.getPublishedNews>> = [];
    let trendingNews: Awaited<ReturnType<typeof NewsService.getTrendingNews>> = [];
    let debug: any = null;
    try {
        const [n, t] = await Promise.all([
            NewsService.getPublishedNews({ category: selectedCategory, country: selectedCountry }).catch(() => []),
            NewsService.getTrendingNews(8).catch(() => [])
        ]);
        newsItems = n || [];
        trendingNews = t || [];
        if (newsItems.length === 0) {
            const all = await NewsService.getAllNews().catch(() => []);
            newsItems = (all || []).filter((x: any) => {
                const s = String(x.status || '').toLowerCase();
                return s === 'published' || s === 'live';
            });
        }
    } catch {
        newsItems = [];
        trendingNews = [];
    }

    async function getDebug() {
        const envConfigured = {
            url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            anon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            service: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        };
        const client = supabaseAdmin || supabase;
        const pub = await client
            .from('news')
            .select('*', { count: 'exact', head: true })
            .or('status.eq.published,status.eq.Published,status.eq.live');
        const all = await client.from('news').select('*', { count: 'exact', head: true });
        return {
            envConfigured,
            counts: {
                published: pub.count ?? null,
                all: all.count ?? null,
            },
            errors: {
                published: pub.error?.message || null,
                all: all.error?.message || null,
            },
        };
    }
    if (process.env.NODE_ENV === 'development' || newsItems.length === 0) {
        try {
            debug = await getDebug();
        } catch {
            debug = null;
        }
    }

    const leadStory = newsItems[0];
    const secondaryStories = newsItems.slice(1, 4);
    const globalStream = newsItems.slice(4);

    return (

        <div className="min-h-screen news-paper-theme pb-20">
            <NewsNavbar />

            {(debug || newsItems.length === 0) && (
                <div className={`mx-4 mt-4 rounded-2xl border ${newsItems.length > 0 ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'} p-4`}>
                    <div className="text-xs font-bold uppercase tracking-widest text-slate-700">News Diagnostics</div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-600">
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="font-semibold text-slate-800">Env</div>
                            <div>URL: {String(!!(debug?.envConfigured?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL))}</div>
                            <div>Anon: {String(!!(debug?.envConfigured?.anon ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))}</div>
                            <div>Service: {String(!!(debug?.envConfigured?.service ?? process.env.SUPABASE_SERVICE_ROLE_KEY))}</div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="font-semibold text-slate-800">Counts</div>
                            <div>Published: {debug?.counts?.published ?? 'N/A'}</div>
                            <div>All: {debug?.counts?.all ?? 'N/A'}</div>
                        </div>
                        <div className="rounded-lg border border-slate-200 bg-white p-3">
                            <div className="font-semibold text-slate-800">Errors</div>
                            <div>Published: {debug?.errors?.published || 'None'}</div>
                            <div>All: {debug?.errors?.all || 'None'}</div>
                        </div>
                    </div>
                    {newsItems.length === 0 && (
                        <div className="mt-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            If empty: set env keys in .env.local and insert a published news row.
                        </div>
                    )}
                </div>
            )}

            <div className="container mx-auto px-4 mt-8">
                {newsItems.length > 0 ? (
                    <div className="space-y-16">
                        {/* Tier 1: The Epicenter (Lead Narrative) */}
                        {leadStory && selectedCategory === 'All' && (
                            <section className="border-b-2 border-slate-900/5 pb-12">
                                <Link href={`/news/${leadStory.slug}`} className="group block">
                                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,450px] gap-12 items-center">
                                        <div className="order-2 lg:order-1 space-y-6">
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700">Editorial Lead</span>
                                                <span className="w-12 h-[1px] bg-red-700/30"></span>
                                            </div>
                                            <h1 className="text-4xl md:text-7xl font-serif font-black text-slate-900 leading-[1.05] tracking-tight group-hover:text-red-700 transition-colors">
                                                {leadStory.title}
                                            </h1>
                                            <p className="text-lg md:text-xl text-slate-500 font-serif leading-relaxed line-clamp-3">
                                                {leadStory.summary}
                                            </p>
                                            <div className="flex items-center gap-4 pt-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase text-slate-400">Published By Refectl Intelligence Agency</span>
                                                    <span className="text-xs font-bold text-slate-900">{format(new Date(leadStory.published_at || leadStory.created_at), 'MMMM dd, yyyy')}</span>
                                                </div>
                                                <div className="h-8 w-[1px] bg-slate-200"></div>
                                                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest flex items-center gap-2">
                                                    Full Analysis <ArrowRight size={12} />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="order-1 lg:order-2">
                                            <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl">
                                                <NewsImage
                                                    src={leadStory.cover_image || '/news-placeholder.jpg'}
                                                    alt={leadStory.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </section>
                        )}

                        {/* Tier 2: Secondary Intelligence (Analytical Grid) */}
                        <section>
                            <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-4">
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-red-700" /> Secondary Intelligence
                                </h2>
                                <Link href="/news/archive" className="text-[10px] font-black uppercase text-slate-400 hover:text-red-700 flex items-center gap-1 transition-colors">
                                    View Archive <ChevronRight size={10} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                {secondaryStories.map((story) => (
                                    <Link key={story.id} href={`/news/${story.slug}`} className="group block">
                                        <article className="space-y-4">
                                            <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-5">
                                                <NewsImage
                                                    src={story.cover_image || '/news-placeholder.jpg'}
                                                    alt={story.title}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-red-700 border border-red-700/20 px-2 py-0.5 rounded">
                                                {story.category}
                                            </span>
                                            <h3 className="text-xl md:text-2xl font-serif font-black text-slate-900 group-hover:text-red-700 transition-colors leading-tight">
                                                {story.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-serif">
                                                {story.summary}
                                            </p>
                                            <div className="pt-2 text-[10px] font-bold text-slate-400 flex items-center justify-between">
                                                <span>{format(new Date(story.created_at), 'MMM dd')}</span>
                                                <span className="flex items-center gap-1"><TrendingUp size={10} /> {story.view_count || 0}</span>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Middle Ground: Recent Pulse & Featured Feed */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-12 pt-8">
                            {/* Tier 3: Global News Stream ( Reuters Style Efficiency ) */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 mb-8 border-b border-slate-200 pb-4">
                                    <Clock size={16} className="text-red-700" />
                                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">The News Stream</h2>
                                </div>
                                <AnimatedList className="divide-y divide-slate-100">
                                    {globalStream.map((item) => (
                                        <AnimatedItem key={item.id}>
                                            <Link href={`/news/${item.slug}`} className="group block py-6">
                                                <div className="flex gap-6 items-start">
                                                    <div className="w-24 md:w-32 aspect-square rounded-xl overflow-hidden flex-shrink-0">
                                                        <NewsImage
                                                            src={item.cover_image || '/news-placeholder.jpg'}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase text-slate-400">
                                                            <span className="text-red-700">{item.country}</span>
                                                            <span>•</span>
                                                            <span>{format(new Date(item.created_at), 'HH:mm')}</span>
                                                        </div>
                                                        <h4 className="text-lg md:text-xl font-serif font-black text-slate-900 group-hover:text-red-700 transition-colors leading-snug">
                                                            {item.title}
                                                        </h4>
                                                        <p className="hidden md:block text-sm text-slate-500 line-clamp-2 font-serif">
                                                            {item.summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Link>
                                        </AnimatedItem>
                                    ))}
                                </AnimatedList>
                            </div>

                            {/* Sidebar: Editorial Intelligence Panel */}
                            <aside className="space-y-12 lg:border-l lg:pl-10 lg:border-slate-100">
                                {/* Trending Now */}
                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-red-700 mb-8 flex items-center gap-2">
                                        <TrendingUp size={14} /> Intelligence Pulse
                                    </h3>
                                    <AnimatedList className="space-y-8">
                                        {trendingNews.slice(0, 5).map((news, idx) => (
                                            <AnimatedItem key={news.id}>
                                                <Link href={`/news/${news.slug}`} className="group block">
                                                    <div className="flex gap-4">
                                                        <span className="text-3xl font-black text-slate-100 group-hover:text-red-700/20 transition-colors">{idx + 1}</span>
                                                        <div className="space-y-1">
                                                            <h4 className="text-[13px] font-black leading-tight line-clamp-2 text-slate-800 group-hover:text-red-700 transition-colors uppercase">
                                                                {news.title}
                                                            </h4>
                                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{news.category}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </AnimatedItem>
                                        ))}
                                    </AnimatedList>
                                </section>

                                {/* Newsletter Branding - Visual Only */}
                                <section className="bg-red-700 p-8 rounded-[2rem] text-white">
                                    <h3 className="text-2xl font-serif font-black mb-4 leading-tight">The Morning Briefing</h3>
                                    <p className="text-white/70 text-xs mb-6 font-serif">The most critical global intelligence, delivered with authoritative clarity to your terminal every dawn.</p>
                                    <div className="space-y-2">
                                        <input
                                            placeholder="intel@agency.net"
                                            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-white/40 focus:ring-2 focus:ring-white/40 outline-none"
                                        />
                                        <button className="w-full bg-white text-red-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                            Apply for access
                                        </button>
                                    </div>
                                </section>

                                {/* Market Indices / Quick Categories */}
                                <section>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                        <Grid size={14} /> Desktop Explorer
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {['Nepal', 'USA', 'Economy', 'Global', 'Tech', 'Politics', 'Opinion'].map(cat => (
                                            <Link
                                                key={cat}
                                                href={`/news?category=${cat}`}
                                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-[10px] font-black uppercase text-slate-500 hover:bg-red-700 hover:text-white hover:border-red-700 transition-all"
                                            >
                                                {cat}
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            </aside>
                        </div>
                    </div>
                ) : (
                    <div className="py-40 text-center bg-slate-50/50 rounded-[4rem] border border-dashed border-slate-200">
                        <div className="max-w-md mx-auto">
                            <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-6" />
                            <h3 className="text-3xl font-serif font-black text-slate-900">Desk is Quiet</h3>
                            <p className="text-slate-500 font-serif mt-2">The intelligence stream is currently idle. Please check back for updates.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
}
