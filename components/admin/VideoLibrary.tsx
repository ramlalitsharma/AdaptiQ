'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VideoUploader } from '@/components/video/VideoUploader';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';

interface MediaAsset {
  id: string;
  type: 'video' | 'live';
  title: string;
  description?: string;
  videoId?: string;
  roomId?: string;
  provider: string;
  status: string;
  fileSize?: number;
  duration?: number;
  thumbnailUrl?: string;
  createdAt: string;
  playbackUrl?: string;
}

export function VideoLibrary() {
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'live'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateLive, setShowCreateLive] = useState(false);
  const [courses, setCourses] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    loadContent();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await fetch('/api/courses/list');
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (error) {
      console.error('Failed to load courses:', error);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      const [videoRes, liveRes] = await Promise.all([
        fetch('/api/video/upload-free'),
        fetch('/api/live/rooms')
      ]);

      const videoData = await videoRes.json();
      const liveData = await liveRes.json();

      const normalizedVideos: MediaAsset[] = (videoData.videos || []).map((v: any) => ({
        ...v,
        id: v._id || v.id,
        type: 'video',
      }));

      const normalizedLive: MediaAsset[] = (liveData.rooms || []).map((r: any) => ({
        ...r,
        id: r._id || r.id,
        type: 'live',
        title: r.roomName,
        videoId: r.roomId, // Map roomId to videoId for consistency in grid
      }));

      const allItems = [...normalizedVideos, ...normalizedLive].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setItems(allItems);
    } catch (error) {
      console.error('Failed to load content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActionComplete = () => {
    setShowUpload(false);
    setShowCreateLive(false);
    loadContent();
  };

  const handleDelete = async (item: MediaAsset) => {
    if (!confirm(`Are you sure you want to delete this ${item.type === 'video' ? 'video' : 'live room'}?`)) return;

    try {
      const endpoint = item.type === 'video' ? `/api/video/${item.videoId}` : `/api/live/rooms/${item.roomId}`;
      const res = await fetch(endpoint, { method: 'DELETE' });

      if (res.ok) loadContent();
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalStorage = items.filter(i => i.type === 'video').reduce((acc, v) => acc + (v.fileSize || 0), 0) / (1024 * 1024);
  const liveCount = items.filter(i => i.type === 'live' && i.status !== 'ended').length;

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse">Initializing Broadcast Studio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Dynamic Status Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-[2rem]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <Badge variant="info" className="text-[10px] font-bold">TOTAL ASSETS</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Inventory</p>
              <h4 className="text-2xl font-black text-slate-900">{items.length}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-[2rem]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </div>
              </div>
              <Badge variant="success" className="text-[10px] font-bold">LIVE NOW</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Sessions</p>
              <h4 className="text-2xl font-black text-slate-900">{liveCount}</h4>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all rounded-[2rem]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <Badge variant="warning" className="text-[10px] font-bold">CLOUD STORAGE</Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Usage</p>
              <h4 className="text-2xl font-black text-slate-900">{totalStorage.toFixed(2)} MB</h4>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
          <Button
            onClick={() => { setShowUpload(!showUpload); setShowCreateLive(false); }}
            className={`flex-1 font-bold rounded-2xl shadow-xl transition-all ${showUpload ? 'bg-slate-900' : 'bg-blue-600'}`}
          >
            {showUpload ? 'Close Media Uploader' : '+ Upload Video'}
          </Button>
          <Button
            variant="outline"
            onClick={() => { setShowCreateLive(!showCreateLive); setShowUpload(false); }}
            className={`flex-1 font-bold rounded-2xl shadow-sm border-2 transition-all ${showCreateLive ? 'border-indigo-600 text-indigo-600 bg-indigo-50' : 'border-slate-200'}`}
          >
            {showCreateLive ? 'Cancel Broadcast' : '+ Go Live Now'}
          </Button>
        </div>
      </div>

      {/* Live Broadcast Configuration */}
      {showCreateLive && (
        <div className="glass-effect p-1 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-[1.4rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-indigo-600 rounded-full"></div>
                <h3 className="text-2xl font-black text-slate-900">Broadcast Configuration</h3>
              </div>
              <Badge variant="info" className="font-black tracking-widest">REAL-TIME</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Internal Title</label>
                  <Input
                    placeholder="e.g. Advanced Calculus Masterclass"
                    className="py-6 rounded-2xl border-slate-100 bg-slate-50/50"
                    id="live-title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Course Association</label>
                  <select
                    id="live-course"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full py-4 px-4 rounded-2xl border border-slate-100 bg-slate-50/50 text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                  >
                    <option value="">Select a Course (Optional)</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-500">Broadcast Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-600">Recording</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-600">Live Chat</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-600">Whiteboard</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100">
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded-lg border-slate-200 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-600">Screen Share</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-8 py-8 rounded-2xl font-black text-xl bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all hover:-translate-y-1"
              onClick={async () => {
                const title = (document.getElementById('live-title') as HTMLInputElement).value;
                const res = await fetch('/api/live/rooms', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: title,
                    courseId: selectedCourse,
                    contentType: 'live'
                  })
                });
                if (res.ok) handleActionComplete();
              }}
            >
              Initialize Broadcast Environment
            </Button>
          </div>
        </div>
      )}

      {/* Asset Explorer Control Bar */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All Assets
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Media Masterclasses
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'live' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Live Broadcasts
            </button>
          </div>

          <div className="flex items-center gap-4 flex-1 lg:max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <Input
                placeholder={`Search in ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-6 rounded-2xl border-none bg-white shadow-sm font-medium"
              />
            </div>
            <div className="flex items-center bg-white p-1 rounded-2xl shadow-sm border border-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-xl ${viewMode === 'grid' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-xl ${viewMode === 'list' ? 'bg-slate-100 text-blue-600' : 'text-slate-400'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Console */}
      {showUpload && (
        <div className="glass-effect p-1 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-white rounded-[1.4rem] p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="text-xl font-black text-slate-900">Upload Media Asset</h3>
            </div>
            <VideoUploader
              onUploadComplete={handleActionComplete}
              onError={(error) => alert(`Upload error: ${error}`)}
            />
          </div>
        </div>
      )}

      {/* Asset Display */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 rounded-[2.5rem] bg-slate-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Studio is empty</h3>
          <p className="text-slate-500 font-medium">No {activeTab} assets found matching your criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="group relative overflow-hidden border-none bg-white hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 rounded-3xl">
              <div
                className={`aspect-video relative overflow-hidden cursor-pointer ${item.type === 'live' ? 'bg-slate-900' : 'bg-slate-100'}`}
                onClick={() => window.open(item.type === 'live' ? `/live/${item.roomId}` : item.playbackUrl, '_blank')}
              >
                {item.thumbnailUrl ? (
                  <Image src={item.thumbnailUrl} alt={item.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" unoptimized />
                ) : item.type === 'live' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-white/20">
                    <span className="text-6xl mb-2">🎥</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Broadcast Environment</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">📹</span>
                  </div>
                )}

                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={`backdrop-blur-md border-none text-[10px] font-black uppercase text-white px-2.5 ${item.type === 'live' ? 'bg-red-500/80' : 'bg-black/60'}`}>
                    {item.type === 'live' ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                        LIVE SESSION
                      </span>
                    ) : 'MEDIA ASSET'}
                  </Badge>
                  {item.status !== 'ready' && item.status !== 'active' && (
                    <Badge className="backdrop-blur-md bg-amber-500/80 border-none text-[10px] font-black uppercase text-white px-2.5">
                      {item.status}
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex flex-col gap-1 mb-4">
                  <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">{item.title}</h3>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    {item.type === 'video' ? (
                      <>
                        <span>{(item.fileSize || 0 / 1024 / 1024).toFixed(1)} MB</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{item.provider.toUpperCase()}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-blue-500">Virtual Classroom</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{item.provider.toUpperCase()}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="col-span-1 text-xs font-bold rounded-xl h-10 border-slate-100 hover:border-blue-600 hover:text-blue-600 transition-all"
                    onClick={() => window.open(item.type === 'live' ? `/live/${item.roomId}` : item.playbackUrl, '_blank')}
                  >
                    {item.type === 'live' ? 'Launch' : 'Preview'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="col-span-1 text-xs font-bold rounded-xl h-10 border-slate-100 hover:border-red-600 hover:text-red-600 transition-all"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* List View simplified version */
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2.5rem]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Studio Asset</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Type</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.title}</td>
                    <td className="px-8 py-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{item.type}</td>
                    <td className="px-8 py-4">
                      <Badge variant={item.status === 'ready' || item.status === 'scheduled' ? 'success' : 'info'} className="text-[10px] font-black">
                        {item.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <Button variant="ghost" className="h-10 text-xs font-bold" onClick={() => handleDelete(item)}>Delete</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
