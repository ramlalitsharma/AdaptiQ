import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getDatabase } from '@/lib/mongodb';

interface LiveRoom {
  id: string;
  roomId: string;
  roomName: string;
  roomUrl: string;
  status: string;
  createdAt: string;
  courseId?: string;
  courseTitle?: string;
}

export const dynamic = 'force-dynamic';

export default async function LiveClassesPage() {
  const db = await getDatabase();
  const allContent = await db
    .collection('liveRooms')
    .find({ status: { $in: ['active', 'scheduled', 'ready'] } })
    .sort({ contentType: 1, createdAt: -1 })
    .limit(48)
    .toArray()
    .catch(() => []);

  const liveContent = allContent
    .filter((c: any) => c.contentType !== 'video')
    .map((room: any) => ({
      id: String(room._id),
      roomId: room.roomId,
      roomName: room.roomName || 'Live classroom',
      roomUrl: room.roomUrl,
      status: room.status || 'scheduled',
      createdAt: room.createdAt instanceof Date ? room.createdAt.toISOString() : room.createdAt || new Date().toISOString(),
      courseTitle: room.courseTitle || room.courseId,
    }));

  const videoClasses = allContent
    .filter((c: any) => c.contentType === 'video')
    .map((vid: any) => ({
      id: String(vid._id),
      title: vid.roomName,
      playbackUrl: vid.playbackUrl || vid.roomUrl,
      courseTitle: vid.courseTitle || vid.courseId,
      createdAt: vid.createdAt instanceof Date ? vid.createdAt.toISOString() : vid.createdAt || new Date().toISOString(),
      thumbnail: vid.thumbnail || '/images/video-placeholder.jpg',
    }));

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      {/* Cinematic Hero Section */}
      <div className="min-h-[600px] lg:h-[700px] relative overflow-hidden bg-slate-900 group flex items-center">
        <div className="absolute inset-0 z-0 scale-105 group-hover:scale-110 transition-transform duration-[10s] opacity-60">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-transparent to-teal-900 mix-blend-overlay"></div>
          <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070')] bg-cover bg-center"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#f8fafc] via-slate-900/40 to-transparent z-10"></div>

        <div className="container mx-auto px-4 relative z-20 pt-32 pb-32">
          <div className="max-w-4xl space-y-8">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]"></span>
              <span className="text-sm font-black text-white/90 uppercase tracking-[0.3em]">Universal Live Hub</span>
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.85]">
              Real-time Impact. <br />
              <span className="text-blue-400">On-Demand Mastery.</span>
            </h1>
            <p className="text-xl text-white/70 font-medium max-w-2xl leading-relaxed">
              Experience the next generation of digital learning. Join interactive live classrooms or explore our curated vault of world-class video masterclasses.
            </p>
            <div className="flex flex-wrap gap-5 pt-6">
              <Link href="#live-now">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-8 rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/20 transition-all hover:-translate-y-1">
                  Go Live
                </Button>
              </Link>
              <Link href="#masterclasses">
                <Button variant="outline" className="bg-white/10 backdrop-blur-md border-white/20 text-white px-10 py-8 rounded-2xl font-black text-lg hover:bg-white/20 transition-all">
                  Watch Vault
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-30 space-y-24">
        {/* Section 1: Live Experience */}
        <section id="live-now" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Happening Now</h2>
              <p className="text-slate-500 font-medium max-w-2xl">
                Interactive rooms currently streaming. Join real instructors and engage with peers worldwide.
              </p>
            </div>
            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
              <div className="px-4 py-2 bg-blue-50 rounded-xl text-blue-600 font-black text-xs uppercase">
                {liveContent.length} Active Sessions
              </div>
            </div>
          </div>

          {liveContent.length === 0 ? (
            <div className="py-24 rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-6xl grayscale opacity-20">📡</div>
              <h3 className="text-2xl font-black text-slate-900">Broadcasts Resuming Shortly</h3>
              <p className="text-slate-500 max-w-sm">No live sessions are active right now. Explore our recorded masterclasses below while you wait.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {liveContent.map((room) => (
                <div key={room.id} className="group relative bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 border border-slate-100">
                  <div className="aspect-[16/10] bg-slate-900 rounded-[2rem] relative overflow-hidden mb-6">
                    <img
                      src={`https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?q=80&w=1974`}
                      className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-red-500 text-white border-none px-3 py-1 font-black animate-pulse uppercase tracking-widest text-[10px]">
                        Live Room
                      </Badge>
                    </div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">{room.courseTitle || 'Masterclass'}</p>
                      <h3 className="text-2xl font-black text-white leading-tight">{room.roomName}</h3>
                    </div>
                  </div>

                  <div className="px-2 pb-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                            <img src={`https://i.pravatar.cc/150?u=${room.id}${i}`} alt="" />
                          </div>
                        ))}
                        <div className="h-8 px-2 flex items-center justify-center bg-slate-100 text-[10px] font-black rounded-full border-2 border-white">+12</div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by Jitsi</span>
                    </div>

                    <Link href={`/live/${room.roomId}`} className="w-full">
                      <button className="w-full py-5 bg-blue-600 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl shadow-blue-200/50">
                        Join Conversation
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: Video Classes */}
        <section id="masterclasses" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Masterclass Vault</h2>
              <p className="text-slate-500 font-medium max-w-2xl">
                On-demand video classes curated for deep learning. Pure cinematic quality, zero distractions.
              </p>
            </div>
          </div>

          {videoClasses.length === 0 ? (
            <div className="py-24 rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-6xl grayscale opacity-20">🎬</div>
              <h3 className="text-2xl font-black text-slate-900">Archive Under Maintenance</h3>
              <p className="text-slate-500 max-w-sm">We're indexing our latest video content. They will appear here shortly.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {videoClasses.map((video) => (
                <div key={video.id} className="group cursor-pointer" onClick={() => window.open(video.playbackUrl, '_blank')}>
                  <div className="aspect-video bg-slate-200 rounded-[2rem] overflow-hidden relative mb-4 shadow-lg group-hover:shadow-2xl group-hover:-translate-y-1 transition-all duration-500">
                    <img
                      src={video.thumbnail || `https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1932`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt=""
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/40 scale-75 group-hover:scale-100 transition-transform">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-black text-white">
                      CLASS
                    </div>
                  </div>
                  <div className="space-y-1 px-2">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{video.courseTitle || 'Masterclass'}</p>
                    <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{video.title}</h4>
                    <p className="text-xs text-slate-400 font-medium">Added {new Date(video.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Admin Quick Action */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link href="/admin/live-classes">
          <Button className="bg-slate-900 text-white rounded-2xl h-14 w-14 shadow-2xl hover:scale-110 transition-all flex items-center justify-center p-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
}

