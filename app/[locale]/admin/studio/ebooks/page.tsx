import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { prisma } from '@/lib/prisma';
import { EbookStudio } from '@/components/admin/EbookStudio';

export const dynamic = 'force-dynamic';

export default async function EbookStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const ebooks = await prisma.ebook.findMany({
    select: { id: true, title: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 12,
  });
  const summaries = ebooks.map((ebook: { id: any; title: any; updatedAt: any; }) => ({
    id: ebook.id,
    title: ebook.title,
    updatedAt: ebook.updatedAt,
  }));

  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg text-slate-900 dark:text-slate-100">
      <header className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-elite-accent-cyan/10 border border-slate-300 dark:border-elite-accent-cyan/20 w-fit">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-elite-accent-cyan">Studio Terminal Alpha</span>
            </div>
            <h1 className="text-4xl font-black text-black dark:text-white uppercase tracking-tighter">
              Knowledge <span className="text-gradient-cyan">Architect</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium uppercase tracking-[0.1em] max-w-2xl">
              Produce high-density intelligence nodes, structured ebooks, and cognitive revision guides.
            </p>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <EbookStudio recentEbooks={summaries} />
      </main>
    </div>
  );
}
