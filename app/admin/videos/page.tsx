import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { VideoLibrary } from '@/components/admin/VideoLibrary';

export const dynamic = 'force-dynamic';

export default async function VideoLibraryPage() {
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
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-black text-blue-600 uppercase tracking-widest">Management Studio</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Video Asset Library</h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl text-balance">
              Professional-grade video management. Organize your master-class assets, track storage usage, and deploy world-class learning content.
            </p>
          </div>
        </div>

        <VideoLibrary />
      </div>
    </div>
  );
}

