'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface LiveRoom {
  id: string;
  roomId: string;
  roomName: string;
  roomUrl: string;
  courseId?: string;
  createdBy: string;
  createdAt: string;
  status: string;
  contentType: 'live' | 'video';
  playbackUrl?: string;
  provider: 'jitsi' | 'zoom' | 'google-meet' | 'custom';
  meetingId?: string;
  config: any;
}

interface LiveClassManagerProps {
  initialRooms: LiveRoom[];
}

export function LiveClassManager({ initialRooms }: LiveClassManagerProps) {
  const [rooms, setRooms] = useState(initialRooms);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    contentType: 'live' as 'live' | 'video',
    playbackUrl: '',
    maxParticipants: 50,
    enableRecording: true,
    enableScreenshare: true,
    enableChat: true,
    enableWhiteboard: true,
  });

  const handleCreateRoom = async () => {
    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    if (formData.contentType === 'video' && !formData.playbackUrl.trim()) {
      alert('Playback URL is required for video classes');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/live/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          contentType: formData.contentType,
          playbackUrl: formData.playbackUrl,
          courseId: formData.courseId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create room');
      }

      // Add new room to list
      setRooms([{ ...data.room, id: data.room.id, createdAt: new Date().toISOString() }, ...rooms]);
      setShowCreateForm(false);
      setFormData({
        name: '',
        courseId: '',
        maxParticipants: 50,
        enableRecording: true,
        enableScreenshare: true,
        enableChat: true,
        enableWhiteboard: true,
      });
    } catch (error: any) {
      alert(error.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Classrooms</CardTitle>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="inverse"
            >
              {showCreateForm ? 'Cancel' : '+ Create Room'}
            </Button>
          </div>
        </CardHeader>
        {showCreateForm && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Content Type
                </label>
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setFormData({ ...formData, contentType: 'live' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.contentType === 'live' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    Live Session
                  </button>
                  <button
                    onClick={() => setFormData({ ...formData, contentType: 'video' })}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.contentType === 'video' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    Video Class
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.contentType === 'live' ? "e.g., Python Basics - Live" : "e.g., Mastering React Hooks"}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
            </div>

            {formData.contentType === 'video' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Playback URL / Video Source *
                </label>
                <input
                  type="text"
                  value={formData.playbackUrl}
                  onChange={(e) => setFormData({ ...formData, playbackUrl: e.target.value })}
                  placeholder="https://... or link to uploaded video"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                  Supports YouTube, Vimeo, or direct HLS (.m3u8) links
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Link to Course (optional)
              </label>
              <input
                type="text"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                placeholder="Course slug or ID"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            {formData.contentType === 'live' && (
              <div className="grid md:grid-cols-2 gap-4 animate-in fade-in duration-300">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Participants
                  </label>
                  <input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) || 50 })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    min="1"
                    max="1000"
                  />
                </div>
                <div className="flex flex-col justify-end space-y-2 pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={formData.enableRecording}
                      onChange={(e) => setFormData({ ...formData, enableRecording: e.target.checked })}
                    />
                    <span className="text-xs font-semibold text-slate-600">Enable Recording</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded text-blue-600 focus:ring-blue-500"
                      checked={formData.enableChat}
                      onChange={(e) => setFormData({ ...formData, enableChat: e.target.checked })}
                    />
                    <span className="text-xs font-semibold text-slate-600">Enable Chat</span>
                  </label>
                </div>
              </div>
            )}

            <Button
              onClick={handleCreateRoom}
              disabled={loading}
              variant="inverse"
              className="w-full font-bold h-12 rounded-xl"
            >
              {loading ? 'Propagating Class...' : formData.contentType === 'live' ? 'Launch Live Room' : 'Add Video Class'}
            </Button>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room, index) => (
          <Card key={room.id || `room-${index}`} className="group hover:shadow-xl transition-all duration-300 border-none bg-white rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {room.contentType === 'video' ? (
                      <span className="text-xl">🎬</span>
                    ) : (
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                    <Badge
                      variant={room.contentType === 'video' ? 'secondary' : 'info'}
                      className="text-[10px] font-black uppercase tracking-widest"
                    >
                      {room.contentType || 'live'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-black text-slate-900 line-clamp-1">{room.roomName}</CardTitle>
                </div>
                <Badge
                  variant={room.status === 'active' || room.status === 'ready' ? 'success' : 'warning'}
                  className="rounded-full px-3 py-1 text-[10px] font-bold"
                >
                  {room.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-slate-500 font-medium line-clamp-1">
                  {room.courseId ? `Linked: ${room.courseId}` : 'Open Community Session'}
                </p>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight text-slate-400">
                  <span>Provider: {room.provider?.toUpperCase() || 'JITSI'}</span>
                  <span>{new Date(room.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {room.contentType === 'video' ? (
                  <button
                    onClick={() => window.open(room.playbackUrl || room.roomUrl, '_blank')}
                    className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Watch Now
                  </button>
                ) : (
                  <Link href={`/live/${room.roomId}`} className="flex-1">
                    <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Join Room
                    </button>
                  </Link>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(room.roomUrl || room.playbackUrl || '');
                    alert('Source link copied to clipboard');
                  }}
                  className="p-3 rounded-xl border border-slate-100 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012-2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rooms.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600">No live rooms created yet. Create your first room to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
