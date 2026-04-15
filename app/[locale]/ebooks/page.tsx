import { Metadata } from 'next';
import { Suspense } from 'react';
import { Link } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ebooks Library',
  description: 'Browse modern, professional ebooks and study guides.',
};

async function fetchEbooks() {
  try {
    const ebooks = await prisma.ebook.findMany({
      select: { id: true, title: true, tags: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 24,
    });
    const items = ebooks.map((e: { id: string; title: string | null; tags: unknown; updatedAt: Date | null }) => ({
      id: e.id,
      title: e.title || '',
      tags: Array.isArray(e.tags) ? e.tags : [],
      updatedAt: e.updatedAt || null,
    }));
    return { items };
  } catch {
    return { items: [] };
  }
}

export default async function EbooksLibraryPage() {
  const { items } = await fetchEbooks();

  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg text-slate-900 dark:text-slate-100 selection:bg-elite-accent-cyan/30">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-elite-accent-cyan/10 dark:bg-elite-accent-cyan/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-elite-accent-purple/5 dark:bg-elite-accent-purple/5 rounded-full blur-[100px]" />
      </div>

      <main className="container mx-auto px-6 py-20 relative z-10 space-y-16">
        {/* Header Section */}
        <header className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-xl mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-elite-accent-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-elite-accent-cyan"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-elite-accent-cyan">Neural Archives Active</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.85] mb-8 text-black dark:text-white">
            Ebooks <br />
            <span className="text-gradient-cyan">Intelligence</span>
          </h1>
          <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-2xl uppercase tracking-wider">
            Access high-density knowledge assets and adaptive study nodes engineered for cognitive evolution.
          </p>
        </header>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <span className="text-slate-500 group-focus-within:text-elite-accent-cyan transition-colors">🔍</span>
            </div>
            <input
              type="search"
              placeholder="Query the archives..."
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-3xl pl-14 pr-6 py-5 text-sm font-bold tracking-widest uppercase outline-none transition-all backdrop-blur-xl placeholder:text-slate-400 dark:placeholder:text-slate-600 text-black dark:text-white"
            />
          </div>
          <div className="relative min-w-[200px]">
            <select className="w-full h-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-3xl px-6 py-5 text-[10px] font-black uppercase tracking-widest outline-none transition-all backdrop-blur-xl appearance-none cursor-pointer text-slate-700 dark:text-slate-300">
              <option className="bg-white dark:bg-elite-bg">All Domains</option>
              <option className="bg-white dark:bg-elite-bg">Adaptive</option>
              <option className="bg-white dark:bg-elite-bg">Intelligence</option>
              <option className="bg-white dark:bg-elite-bg">Infrastructure</option>
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-slate-500">
              ▼
            </div>
          </div>
        </div>

        {/* Ebooks Grid */}
        <Suspense fallback={<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 whitespace-nowrap overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card-premium rounded-[2.5rem] h-[400px] animate-pulse" />
          ))}
        </div>}>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.length === 0 ? (
              <div className="col-span-full glass-card-premium rounded-[3rem] p-20 text-center border border-dashed border-white/10">
                <div className="text-4xl mb-6 opacity-30">📚</div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-500">No Intelligence Assets Found</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-2">Initialize new nodes in the admin terminal</p>
              </div>
            ) : (
              items.map((item: any) => (
                <Link key={item.id} href={`/ebooks/${item.id}`} className="group relative">
                  <div className="glass-card-premium rounded-[2.5rem] border border-white/5 overflow-hidden transition-all duration-500 hover:border-elite-accent-cyan/30 hover:-translate-y-2 group-hover:shadow-[0_20px_50px_-20px_rgba(6,182,212,0.3)] flex flex-col h-full uppercase tracking-tighter">
                    {/* Visual Cover Area */}
                    <div className="aspect-[4/5] bg-gradient-to-br from-white/5 to-white/[0.02] relative overflow-hidden flex items-center justify-center border-b border-white/5">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-elite-accent-cyan/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                      {/* Abstract Book Shape */}
                      <div className="w-2/3 aspect-[3/4] bg-white dark:bg-elite-bg rounded-lg border border-slate-200 dark:border-white/10 shadow-2xl relative transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2">
                        <div className="absolute inset-0 bg-gradient-to-r from-black/5 dark:from-black/40 via-transparent to-transparent opacity-50" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <div className="h-1 w-1/2 bg-elite-accent-cyan/30 rounded-full mb-2" />
                          <div className="h-1 w-1/3 bg-slate-200 dark:bg-white/10 rounded-full" />
                        </div>
                      </div>

                      {/* Hover Overlay Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                        <div className="px-6 py-3 rounded-2xl bg-elite-accent-cyan text-white dark:text-black font-black text-[10px] tracking-[0.2em] shadow-xl shadow-elite-accent-cyan/30">
                          ACCESS NODE
                        </div>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 rounded-md">
                          Asset-Type: Ebook
                        </span>
                        {item.tags?.slice(0, 1).map((t: string) => (
                          <span key={t} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-elite-accent-cyan/10 text-elite-accent-cyan border border-elite-accent-cyan/20 rounded-md">
                            {t}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-xl font-black text-black dark:text-white leading-tight mb-6 group-hover:text-elite-accent-cyan transition-colors line-clamp-2">
                        {item.title}
                      </h3>

                      <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-500 tracking-[0.2em]">
                          {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                        </span>
                        <div className="text-elite-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Suspense>

        {/* Pagination Placeholder */}
        <div className="flex items-center justify-center gap-3 pt-12">
          <button className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-400">
            ←
          </button>
          <button className="w-12 h-12 rounded-2xl bg-elite-accent-cyan text-white dark:text-black font-black text-[10px] shadow-lg shadow-elite-accent-cyan/20">
            01
          </button>
          <button className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 flex items-center justify-center hover:text-slate-900 dark:hover:text-white transition-all">
            02
          </button>
          <button className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-400">
            →
          </button>
        </div>
      </main>
    </div>
  );
}
