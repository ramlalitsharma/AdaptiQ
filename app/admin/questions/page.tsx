import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { serializeQuestionBank } from '@/lib/models/QuestionBank';
import { QuestionBankManager } from '@/components/admin/QuestionBankManager';

export const dynamic = 'force-dynamic';

export default async function QuestionBanksPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const banks = await db.collection('questionBanks').find({}).sort({ updatedAt: -1 }).limit(100).toArray();
  const serialized = banks.map((bank: any) => serializeQuestionBank(bank));

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

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Question Banks</h1>
          <p className="text-sm text-slate-500">
            Build reusable question repositories by subject, difficulty, and exam track. Use them to assemble adaptive exams.
          </p>
        </div>

        <QuestionBankManager initialBanks={serialized} />
      </main>
    </div>
  );
}
