import { unifiedSearch } from '@/lib/search-service';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn, ScaleIn } from '@/components/ui/Motion';
import Link from 'next/link';
import { Search, BookOpen, GraduationCap, Layout, ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default async function SearchPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const { locale } = await params;
  const { q: query, type } = await searchParams;
  setRequestLocale(locale);

  const t = await getTranslations('Common');
  const results = query ? await unifiedSearch(query, { type }) : [];

  const icons = {
    course: <BookOpen className="w-5 h-5 text-blue-500" />,
    blog: <Layout className="w-5 h-5 text-emerald-500" />,
    exam: <GraduationCap className="w-5 h-5 text-purple-500" />,
    subject: <Search className="w-5 h-5 text-slate-500" />,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-dot-grid">
      <div className="container mx-auto px-4 py-12 relative">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none" />

        <FadeIn delay={0.1}>
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Search' }]} className="mb-8" />
        </FadeIn>

        <section className="space-y-8">
          <header className="space-y-4">
            <FadeIn delay={0.2}>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {query ? (
                  <>Results for "<span className="text-blue-600">{query}</span>"</>
                ) : (
                  "Universal Discovery"
                )}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">
                {results.length} results matching your intelligence query
              </p>
            </FadeIn>
          </header>

          <div className="grid gap-6">
            {results.length > 0 ? (
              results.map((result, idx) => (
                <ScaleIn key={result.id} delay={0.1 + idx * 0.05}>
                  <Link href={result.url}>
                    <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/20 dark:border-white/5">
                      <CardContent className="p-6 md:p-8 flex items-center justify-between gap-6">
                        <div className="flex gap-6 items-start">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                            {icons[result.type] || <Search className="w-6 h-6 text-slate-400" />}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                {result.type}
                              </span>
                              {result.metadata?.level && (
                                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                  {result.metadata.level}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                              {result.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 max-w-2xl font-medium">
                              {result.description}
                            </p>
                          </div>
                        </div>
                        <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-slate-200 dark:border-slate-800 group-hover:bg-blue-600 group-hover:border-blue-600 transition-all duration-300">
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </ScaleIn>
              ))
            ) : (
              <FadeIn delay={0.3} className="py-20 text-center space-y-6">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">No results found</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    We couldn't find anything matching "{query}". Try broadening your search terms or exploring by categories.
                  </p>
                </div>
                <Button variant="outline" className="rounded-2xl" asChild>
                  <Link href="/courses">Browse Catalog</Link>
                </Button>
              </FadeIn>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
