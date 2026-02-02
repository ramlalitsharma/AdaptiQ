import { Metadata } from 'next';
import { Suspense } from 'react';
import { Link } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import { PageTurner } from '@/components/ebooks/PageTurner';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ebook',
  description: 'Read modern, competitive ebooks with page-by-page chapters.',
};

async function fetchEbook(id: string) {
  try {
    const doc = await prisma.ebook.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        audience: true,
        tone: true,
        focus: true,
        tags: true,
        releaseAt: true,
        updatedAt: true,
        coverImageUrl: true,
        chapters: true,
      },
    });
    if (!doc) return null;
    const chaptersArray = Array.isArray(doc.chapters) ? (doc.chapters as any[]) : [];
    return {
      id: doc.id,
      title: doc.title || '',
      audience: doc.audience || '',
      tone: doc.tone || '',
      focus: doc.focus || '',
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      releaseAt: doc.releaseAt || null,
      updatedAt: doc.updatedAt || null,
      coverImageUrl: doc.coverImageUrl || null,
      chapters: chaptersArray.map((c: any) => ({
        title: c?.title || '',
        summary: c?.summary || '',
        keyTakeaways: Array.isArray(c?.keyTakeaways) ? c.keyTakeaways : [],
        resources: Array.isArray(c?.resources) ? c.resources : [],
      })),
    };
  } catch {
    return null;
  }
}

export default async function EbookReaderPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const ebook = await fetchEbook(id);
  if (!ebook) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h1 className="text-2xl font-semibold">Ebook not found</h1>
          <p className="mt-2 text-slate-600">It may have been removed or is not available.</p>
          <div className="mt-4">
            <Link href="/ebooks" className="text-teal-700 font-bold">Back to Library</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-10">
          <div className="flex items-start gap-6">
            <div className="w-28 h-36 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
              {ebook.coverImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ebook.coverImageUrl} alt={ebook.title} className="w-full h-full object-cover" />
              ) : null}
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{ebook.title}</h1>
              <p className="mt-2 text-slate-600">{ebook.focus || ebook.tone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(ebook.tags || []).slice(0, 6).map((t: string) => (
                  <span key={t} className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,0.35fr)]">
          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <Suspense>
              {ebook.chapters.length === 0 ? (
                <div className="text-slate-600">No chapters available.</div>
              ) : (
                <PageTurner chapters={ebook.chapters} />
              )}
            </Suspense>
          </article>
          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">About</div>
              <div className="mt-2 text-sm text-slate-600">
                Audience: {ebook.audience || 'N/A'}
              </div>
              <div className="mt-1 text-sm text-slate-600">
                Chapters: {ebook.chapters.length}
              </div>
              {ebook.updatedAt && (
                <div className="mt-1 text-xs text-slate-400">
                  Updated: {new Date(ebook.updatedAt).toLocaleString()}
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">Library</div>
              <div className="mt-2">
                <Link href="/ebooks" className="text-xs font-black uppercase tracking-widest text-teal-700">
                  Back to all ebooks
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
