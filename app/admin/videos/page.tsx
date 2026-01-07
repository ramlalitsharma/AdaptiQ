import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { UnifiedContentStudio } from '@/components/admin/UnifiedContentStudio';

export const dynamic = 'force-dynamic';

export default async function ContentStudioPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10">
        <UnifiedContentStudio />
      </div>
    </div>
  );
}

