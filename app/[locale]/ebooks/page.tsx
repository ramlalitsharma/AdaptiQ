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
    const items = ebooks.map((e) => ({
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-black tracking-tight">Ebooks Library</h1>
          <p className="mt-2 text-slate-600">
            Explore next‑gen, competitive ebooks crafted for modern learners.
          </p>
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <input
            type="search"
            placeholder="Search ebooks..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-3 bg-white"
          />
          <select className="rounded-xl border border-slate-200 px-3 py-3 bg-white">
            <option>All Tags</option>
            <option>adaptive</option>
            <option>notes</option>
            <option>guide</option>
          </select>
        </div>
        <Suspense>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600">
                No ebooks yet.
              </div>
            ) : (
              items.map((item: any) => (
                <div key={item.id} className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="h-32 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 mb-4"></div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {(item.tags || []).slice(0, 4).map((t: string) => (
                      <span key={t} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}</span>
                    <Link href={`/ebooks/${item.id}`} className="text-xs font-black uppercase tracking-widest text-teal-700">
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Suspense>
      </main>
    </div>
  );
}
