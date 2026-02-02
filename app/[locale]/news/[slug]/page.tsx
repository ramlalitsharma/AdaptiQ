import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { NewsService } from '@/lib/news-service';
import { FadeIn, ScaleIn } from '@/components/ui/Motion';
import { TrendingUp, Clock, Globe, Share2, Bookmark, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Script from 'next/script';
import { BRAND_URL } from '@/lib/brand';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { AdBlockerDetector } from '@/components/ads/AdBlockerDetector';
import { CommentsGate } from '@/components/news/CommentsGate';

export async function generateMetadata(
    { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
    const { slug } = await params;
    try {
        const news = await NewsService.getNewsBySlug(slug);
        if (!news) return { title: 'Intelligence Not Found' };

        const publishedDate = news.published_at || news.created_at;
        const imageUrl = news.cover_image || `${BRAND_URL}/og-news.png`;

        return {
            title: `${news.title} | Terai Times News`,
            description: news.summary,
            alternates: {
                canonical: `${BRAND_URL}/news/${slug}`,
            },
            openGraph: {
                title: news.title,
                description: news.summary,
                url: `${BRAND_URL}/news/${slug}`,
                type: 'article',
                publishedTime: publishedDate,
                authors: ['Refectl Intelligence Agency'],
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

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let news = null;
    let trendingNews: any[] = [];

    try {
        news = await NewsService.getNewsBySlug(slug);
        trendingNews = await NewsService.getTrendingNews(6);
    } catch (err) {
        console.error(err);
    }

    if (!news) notFound();

    return (
        <AdBlockerDetector>
            <div className="min-h-screen news-paper-theme pb-32">
                <NewsNavbar />

                {/* NewsArticle Structured Data */}
                <Script
                    id="news-article-schema"
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "NewsArticle",
                            headline: news.title,
                            description: news.summary,
                            image: news.cover_image || `${BRAND_URL}/og-news.png`,
                            datePublished: news.published_at || news.created_at,
                            dateModified: news.updated_at || news.published_at || news.created_at,
                            author: {
                                "@type": "Organization",
                                name: "Refectl Intelligence Agency",
                                url: BRAND_URL,
                            },
                            publisher: {
                                "@type": "Organization",
                                name: "Terai Times",
                                url: BRAND_URL,
                                logo: {
                                    "@type": "ImageObject",
                                    url: `${BRAND_URL}/logo.png`,
                                },
                            },
                            mainEntityOfPage: {
                                "@type": "WebPage",
                                "@id": `${BRAND_URL}/news/${slug}`,
                            },
                        }),
                    }}
                />

                <div className="container mx-auto px-4 mt-12">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-20">
                        {/* Main Content Area */}
                        <article className="max-w-[720px] mx-auto lg:ml-0">
                            <header className="mb-12 space-y-6">
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-700">{news.category} Intelligence</span>
                                    <div className="h-4 w-[1px] bg-slate-200"></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{news.country} Market</span>
                                </div>

                                <h1 className="text-4xl md:text-7xl font-serif font-black text-slate-900 leading-[1.05] tracking-tight">
                                    {news.title}
                                </h1>

                                <div className="flex items-center justify-between py-6 border-y border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-xs">TT</div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-slate-400">Published By Refectl Intelligence Agency</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(new Date(news.published_at || news.created_at), 'MMMM dd, yyyy')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors"><Share2 size={16} className="text-slate-500" /></button>
                                        <button className="p-2.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-colors"><Bookmark size={16} className="text-slate-500" /></button>
                                    </div>
                                </div>

                                <p className="text-xl md:text-2xl text-slate-500 font-serif leading-relaxed italic pr-12">
                                    {news.summary}
                                </p>
                            </header>

                            {news.cover_image && (
                                <section className="mb-12">
                                    <div className="rounded-[2.5rem] overflow-hidden shadow-2xl relative aspect-[16/9]">
                                        <NewsImage src={news.cover_image} alt={news.title} className="w-full h-full" />
                                    </div>
                                    <p className="text-[10px] text-center text-slate-400 mt-4 uppercase font-bold tracking-[0.2em]">Visual Intelligence Asset | source: Terai Times Bureau</p>
                                </section>
                            )}

                            <div className="prose prose-slate prose-lg lg:prose-xl max-w-none text-slate-700 font-serif drop-cap">
                                <div dangerouslySetInnerHTML={{ __html: news.content }} />
                            </div>

                            <footer className="mt-20 pt-10 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {news.tags?.map((tag: string) => (
                                        <span key={tag} className="text-[10px] font-black uppercase text-slate-400 border border-slate-100 px-3 py-1 rounded-full">#{tag}</span>
                                    ))}
                                </div>
                                <Link href="/news" className="text-xs font-black uppercase tracking-widest text-red-700 flex items-center gap-2 hover:gap-3 transition-all">
                                    <ArrowLeft size={14} /> Archive Home
                                </Link>
                            </footer>

                            <CommentsGate slug={news.slug} />
                        </article>

                        {/* Editorial Intelligence Sidebar */}
                        <aside className="hidden lg:block space-y-16">
                            <section className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                <h3 className="text-xs font-black uppercase tracking-widest text-red-700 mb-8 flex items-center gap-2">
                                    <TrendingUp size={14} /> Market Momentum
                                </h3>
                                <div className="space-y-8">
                                    {trendingNews.filter((n: any) => n.id !== news.id).slice(0, 5).map((n: any, idx: number) => (
                                        <Link key={n.id} href={`/news/${n.slug}`} className="group block">
                                            <div className="flex gap-4">
                                                <span className="text-3xl font-black text-slate-200 group-hover:text-red-700/20 transition-colors">{idx + 1}</span>
                                                <div className="space-y-1">
                                                    <h4 className="text-[13px] font-black leading-tight line-clamp-2 text-slate-800 group-hover:text-red-700 transition-colors uppercase">
                                                        {n.title}
                                                    </h4>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{n.category}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-red-700 p-8 rounded-[2rem] text-white overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <h3 className="text-2xl font-serif font-black mb-4 leading-tight">Stay Competitive.</h3>
                                <p className="text-white/60 text-[11px] mb-8 font-serif leading-relaxed">Join 50,000+ professionals receiving daily intelligence reports from Terai Times.</p>
                                <button className="w-full bg-white text-red-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                                    Join the Network
                                </button>
                            </section>

                            <section>
                                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-8 flex items-center gap-2">
                                    <Clock size={14} /> Rapid Scanning
                                </h3>
                                <div className="space-y-6">
                                    {trendingNews.slice(0, 4).map((n: any) => (
                                        <Link key={n.id} href={`/news/${n.slug}`} className="flex gap-4 group">
                                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 relative">
                                                <NewsImage src={n.cover_image || '/news-placeholder.jpg'} alt={n.title} className="w-full h-full group-hover:scale-110 transition-transform" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-[11px] font-black text-slate-800 line-clamp-2 group-hover:text-red-700 transition-colors uppercase leading-snug">
                                                    {n.title}
                                                </h4>
                                                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400">
                                                    <span>{n.country}</span>
                                                    <span>•</span>
                                                    <span>{format(new Date(n.created_at), 'HH:mm')}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </aside>
                    </div>
                </div>
            </div>
        </AdBlockerDetector>
    );
}
