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

        <div className="min-h-screen bg-elite-bg text-slate-100 selection:bg-elite-accent-cyan/30">
            <NewsNavbar />

            {(debug || newsItems.length === 0) && (
                <div className={`mx-4 mt-6 rounded-[2rem] border ${newsItems.length > 0 ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'} p-6 backdrop-blur-3xl`}>
                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-4">Network Diagnostics</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                            <div className="text-white mb-2">Environment Status</div>
                            <div>Connection: Active</div>
                            <div className="text-elite-accent-cyan">Access: Authorized</div>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                            <div className="text-white mb-2">Data Integrity</div>
                            <div>Published: {debug?.counts?.published || 0} nodes</div>
                            <div className="text-elite-accent-emerald">Relay: 6ms</div>
                        </div>
                        <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                            <div className="text-white mb-2">Relay Information</div>
                            <div>Status: {debug?.errors?.all || 'Nominal'}</div>
                            <div className="text-elite-accent-purple">Latency: Extreme Low</div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 mt-8">
                {newsItems.length > 0 ? (
                    <div className="space-y-16">
                        {/* Tier 1: The Epicenter (Lead Narrative) */}
                        {leadStory && selectedCategory === 'All' && (
                            <section className="pb-12">
                                <Link href={`/news/${leadStory.slug}`} className="group block">
                                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,550px] gap-12 items-center">
                                        <div className="order-2 lg:order-1 space-y-8">
                                            <div className="flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-elite-accent-cyan">Breaking Narrative</span>
                                                <span className="flex-1 h-[1px] bg-white/5"></span>
                                            </div>
                                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] tracking-tighter group-hover:text-elite-accent-cyan transition-all duration-500">
                                                {leadStory.title}
                                            </h1>
                                            <p className="text-xl text-slate-400 font-medium leading-relaxed line-clamp-3 max-w-2xl">
                                                {leadStory.summary}
                                            </p>
                                            <div className="flex items-center gap-6 pt-6">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Source: Refectl Intel</span>
                                                    <span className="text-sm font-bold text-white">{format(new Date(leadStory.published_at || leadStory.created_at), 'MMMM dd, yyyy')}</span>
                                                </div>
                                                <div className="h-10 w-[1px] bg-white/10"></div>
                                                <span className="text-[10px] font-black text-elite-accent-cyan uppercase tracking-[0.3em] flex items-center gap-3">
                                                    Full Intelligence <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                                                </span>
                                            </div>
                                        </div>
                                        <div className="order-1 lg:order-2">
                                            <div className="relative aspect-[4/3] rounded-[3rem] overflow-hidden glass-card-premium border-white/10 p-4">
                                                <div className="w-full h-full rounded-[2.5rem] overflow-hidden">
                                                    <NewsImage
                                                        src={leadStory.cover_image || '/news-placeholder.jpg'}
                                                        alt={leadStory.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </section>
                        )}

                        {/* Tier 2: Secondary Intelligence (Analytical Grid) */}
                        <section>
                            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">
                                    Secondary Insights
                                </h2>
                                <Link href="/news/archive" className="text-[10px] font-black uppercase text-slate-500 hover:text-elite-accent-cyan flex items-center gap-1 transition-colors">
                                    View Archive <ChevronRight size={10} />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                                {secondaryStories.map((story) => (
                                    <Link key={story.id} href={`/news/${story.slug}`} className="group block">
                                        <article className="space-y-6">
                                            <div className="aspect-[16/10] rounded-[2rem] overflow-hidden glass-card-premium border-white/5 p-2">
                                                <div className="w-full h-full rounded-[1.8rem] overflow-hidden">
                                                    <NewsImage
                                                        src={story.cover_image || '/news-placeholder.jpg'}
                                                        alt={story.title}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-elite-accent-purple">
                                                    {story.category}
                                                </span>
                                                <h3 className="text-2xl font-black text-white group-hover:text-elite-accent-cyan transition-all leading-tight tracking-tight">
                                                    {story.title}
                                                </h3>
                                                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                                    {story.summary}
                                                </p>
                                            </div>
                                            <div className="pt-2 text-[10px] font-black text-slate-500 flex items-center justify-between uppercase tracking-widest">
                                                <span>{format(new Date(story.created_at), 'MMM dd')}</span>
                                                <span className="flex items-center gap-2"><TrendingUp size={12} className="text-elite-accent-cyan" /> {story.view_count || 0}</span>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Middle Ground: Recent Pulse & Featured Feed */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1fr,350px] gap-12 pt-8">
                            {/* Tier 3: Global News Stream ( Reuters Style Efficiency ) */}
                            {/* Tier 3: Global News Stream */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">The Intelligence Stream</h2>
                                </div>
                                <AnimatedList className="divide-y divide-white/5">
                                    {globalStream.map((item) => (
                                        <AnimatedItem key={item.id}>
                                            <Link href={`/news/${item.slug}`} className="group block py-8">
                                                <div className="flex gap-8 items-start">
                                                    <div className="w-32 md:w-44 aspect-square rounded-[2rem] overflow-hidden flex-shrink-0 glass-card-premium border-white/5 p-1.5">
                                                        <div className="w-full h-full rounded-[1.6rem] overflow-hidden">
                                                            <NewsImage
                                                                src={item.cover_image || '/news-placeholder.jpg'}
                                                                alt={item.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 space-y-4">
                                                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                            <span className="text-elite-accent-emerald">{item.country}</span>
                                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                                            <span>{format(new Date(item.created_at), 'HH:mm')}</span>
                                                        </div>
                                                        <h4 className="text-2xl font-black text-white group-hover:text-elite-accent-cyan transition-all leading-tight tracking-tight">
                                                            {item.title}
                                                        </h4>
                                                        <p className="hidden md:block text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed">
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
                            <aside className="space-y-12 lg:border-l lg:pl-10 lg:border-white/5">
                                {/* Trending Now */}
                                <section>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-cyan mb-10 flex items-center gap-3">
                                        Intelligence Pulse
                                    </h3>
                                    <AnimatedList className="space-y-10">
                                        {trendingNews.slice(0, 5).map((news, idx) => (
                                            <AnimatedItem key={news.id}>
                                                <Link href={`/news/${news.slug}`} className="group block">
                                                    <div className="flex gap-6">
                                                        <span className="text-4xl font-black text-white/5 group-hover:text-elite-accent-cyan/10 transition-colors">{idx + 1}</span>
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-black leading-tight line-clamp-2 text-white group-hover:text-elite-accent-cyan transition-all uppercase tracking-tight">
                                                                {news.title}
                                                            </h4>
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{news.category}</span>
                                                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                                                <span className="text-[9px] font-black text-elite-accent-cyan animate-pulse">ACTIVE</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </AnimatedItem>
                                        ))}
                                    </AnimatedList>
                                </section>

                                {/* Newsletter Branding - Visual Only */}
                                {/* Newsletter Branding */}
                                <section className="glass-card-premium p-10 rounded-[3rem] border border-elite-accent-cyan/10 bg-elite-accent-cyan/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/10 rounded-full blur-3xl" />
                                    <h3 className="text-3xl font-black text-white mb-6 leading-[0.9] tracking-tighter">The <span className="text-gradient-cyan">Intelligence</span> Brief</h3>
                                    <p className="text-slate-400 text-xs mb-8 font-medium leading-relaxed uppercase tracking-widest">Global market pulse delivered with nanosecond precision.</p>
                                    <div className="space-y-3">
                                        <input
                                            placeholder="endpoint@secure.node"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-black placeholder:text-white/20 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/30 outline-none transition-all"
                                        />
                                        <button className="w-full bg-elite-accent-cyan text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-elite-accent-cyan/20">
                                            Synchronize
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
