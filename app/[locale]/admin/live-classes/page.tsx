import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { LiveClassManager } from '@/components/admin/LiveClassManager';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminLiveClassesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    const { requireAdmin } = await import('@/lib/admin-check');
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const rooms = await db
    .collection('liveRooms')
    .find({})
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const roomsData = rooms.map((room: any) => ({
    id: String(room._id),
    roomId: room.roomId,
    roomName: room.roomName,
    roomUrl: room.roomUrl,
    courseId: room.courseId,
    createdBy: room.createdBy,
    createdAt: room.createdAt instanceof Date ? room.createdAt.toISOString() : room.createdAt,
    status: room.status || 'scheduled',
    config: room.config || {},
  }));

  return (
    <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 py-12 relative z-10 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-900 rounded-xl shadow-lg shadow-slate-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-black text-slate-500 uppercase tracking-widest text-[10px]">Universal Studio</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Live & Video Console</h1>
            <p className="text-lg text-slate-500 font-medium max-w-2xl">
              Project real-time impact or deploy cinematic masterclasses. Manage your entire digital presence from one unified studio.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/live/recordings">
              <Button variant="outline" className="rounded-xl font-bold bg-white text-slate-900 border-slate-200 shadow-sm px-6 h-12">
                Archives
              </Button>
            </Link>
          </div>
        </div>

        <LiveClassManager initialRooms={roomsData} />
      </div>
    </div>
  );
}

