import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { serializeQuestionBank } from '@/lib/models/QuestionBank';
import { serializeExamTemplate } from '@/lib/models/ExamTemplate';
import { ExamBuilder } from '@/components/admin/ExamBuilder';

export const dynamic = 'force-dynamic';

export default async function AdminExamsPage({ searchParams }: { searchParams: { bank?: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const [banks, exams] = await Promise.all([
    db.collection('questionBanks').find({}).sort({ name: 1 }).toArray(),
    db.collection('examTemplates').find({}).sort({ updatedAt: -1 }).toArray(),
  ]);

  const bankSummaries = banks.map((bank: any) => serializeQuestionBank(bank));
  const examTemplates = exams.map((exam: any) => serializeExamTemplate(exam));

  const initialBankId = searchParams.bank && bankSummaries.find((bank) => bank.id === searchParams.bank) ? searchParams.bank : bankSummaries[0]?.id || '';

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-slate-900">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/admin">← Admin Panel</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Exam Authoring</h1>
          <p className="text-sm text-slate-500">
            Assemble exams from curated question banks. Select questions, set durations, and publish templates to learners.
          </p>
        </div>

        {bankSummaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            Create a question bank first to author exams.
          </div>
        ) : (
          <ExamBuilder banks={bankSummaries.map((bank) => ({ id: bank.id!, name: bank.name, subject: bank.subject, examType: bank.examType }))} key={initialBankId} />
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Recent exam templates</h2>
          {examTemplates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No exam templates yet.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {examTemplates.map((exam) => (
                <div key={exam.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="text-sm uppercase tracking-wide text-slate-400">Exam template</div>
                  <div className="text-lg font-semibold text-slate-900 mt-1">{exam.name}</div>
                  <div className="text-sm text-slate-500 mt-2 line-clamp-3">{exam.description || 'No description provided.'}</div>
                  <div className="text-xs text-slate-400 mt-3">
                    Questions: {exam.questionIds.length} • Duration: {exam.durationMinutes} mins • Total marks: {exam.totalMarks}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
