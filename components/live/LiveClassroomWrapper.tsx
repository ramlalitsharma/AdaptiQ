'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LiveClassroom } from './LiveClassroom';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/ToastManager';
import { Loader2, Play, Users } from 'lucide-react';

interface LiveClassroomWrapperProps {
  roomId: string;
  roomUrl: string;
  roomName: string;
  isInstructor?: boolean;
  provider?: 'jitsi' | 'daily';
  courseId?: string;
  initialStatus: 'scheduled' | 'active' | 'ended' | 'cancelled';
}

export function LiveClassroomWrapper({
  roomId,
  roomUrl,
  roomName,
  isInstructor,
  provider,
  courseId,
  initialStatus,
}: LiveClassroomWrapperProps) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [isStarting, setIsStarting] = useState(false);
  const { addToast } = useToast();

  // Poll for status updates if student and scheduled
  useEffect(() => {
    if (isInstructor || status !== 'scheduled') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/live/status?roomId=${roomId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.data?.status === 'active') {
            setStatus('active');
            addToast({
              type: 'success',
              title: 'Class Started',
              message: 'The instructor has started the class.',
            });
          } else if (data.data?.status === 'ended') {
            setStatus('ended');
            router.refresh();
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [roomId, status, isInstructor, router]);

  const handleStartClass = async () => {
    setIsStarting(true);
    try {
      const res = await fetch('/api/live/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, status: 'active' }),
      });

      if (!res.ok) throw new Error('Failed to start class');
      
      setStatus('active');
      addToast({
        type: 'success',
        title: 'Class Started',
        message: 'Class started successfully.',
      });
    } catch (error) {
      addToast({
        type: 'warning',
        title: 'Error',
        message: 'Failed to start class.',
      });
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeave = () => {
    router.push(courseId ? `/courses/${courseId}` : '/live');
  };

  const handleEnd = async () => {
    if (!confirm('Are you sure you want to end this class for everyone?')) return;

    try {
      await fetch('/api/live/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, status: 'ended' }),
      });
      
      setStatus('ended');
      router.refresh(); // Will trigger the server-side "ended" view
    } catch (error) {
      addToast({
        type: 'warning',
        title: 'Error',
        message: 'Failed to end class.',
      });
    }
  };

  if (status === 'scheduled') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-slate-800 border-slate-700 text-white p-8 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto ring-1 ring-blue-500/50">
              {isInstructor ? (
                <Play className="w-8 h-8 text-blue-400 ml-1" />
              ) : (
                <Users className="w-8 h-8 text-blue-400" />
              )}
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">{roomName}</h2>
              <p className="text-slate-400">
                {isInstructor 
                  ? "You are the instructor. Start the class when you're ready." 
                  : "Waiting for the instructor to start the class..."}
              </p>
            </div>

            {isInstructor ? (
              <Button 
                onClick={handleStartClass} 
                disabled={isStarting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
              >
                {isStarting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Starting Class...
                  </>
                ) : (
                  "Start Class Now"
                )}
              </Button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 bg-slate-900/50 py-3 rounded-lg animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Checking status automatically...</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <LiveClassroom
      roomUrl={roomUrl}
      roomName={roomName}
      isInstructor={isInstructor}
      provider={provider}
      onLeave={handleLeave}
      onEnd={handleEnd}
    />
  );
}

