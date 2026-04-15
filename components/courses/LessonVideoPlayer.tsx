'use client';

import { useState, useRef } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { InteractiveTranscript } from '@/components/video/InteractiveTranscript';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastManager';
import confetti from 'canvas-confetti';
import { BookOpen, FileText } from 'lucide-react';

interface LessonVideoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  title?: string;
  provider?: 'youtube' | 'vimeo' | 'direct' | 'self-hosted' | 'hls';
  courseSlug: string;
  lessonSlug: string;
  videoChapters?: Array<{ title: string; time: number }>;
}

export function LessonVideoPlayer({
  videoUrl,
  videoId,
  title,
  provider,
  courseSlug,
  videoChapters,
}: LessonVideoPlayerProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoPlayerRef = useRef<any>(null);
  const { addToast } = useToast();

  // Mock transcript for demonstration - In production, this comes from the DB
  const mockTranscript = [
    { time: 0, text: "Welcome to today's deep dive into the architecture of modern AI systems." },
    { time: 10, text: "We'll be exploring how multi-model orchestration with LangChain is changing the landscape." },
    { time: 25, text: "Notice how the system can dynamically switch between LLMs based on cost and complexity." },
    { time: 45, text: "Let's look at the implementation details of the LangChain service wrapper we just built." },
    { time: 60, text: "This pattern allows us to maintain a stable API while swapping underlying providers." },
    { time: 90, text: "Next, we will discuss how interactive transcripts improve learning retention by up to 40%." },
    { time: 120, text: "By synching text with video, we empower students to learn at their own pace." }
  ];

  const handleEnded = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const res = await fetch(`/api/courses/${courseSlug}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        addToast({
          type: 'success',
          title: 'Lesson completed',
          message: 'Progress updated'
        });
        router.refresh(); // Refresh to update progress UI
      }
    } catch (error) {
      console.error('Failed to mark complete:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleProgress = (current: number) => {
    setCurrentTime(current);
  };

  const handleSeek = (time: number) => {
    if (videoPlayerRef.current?.seekTo) {
      videoPlayerRef.current.seekTo(time);
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-4 bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
      <div className="lg:col-span-3">
        <VideoPlayer
          ref={videoPlayerRef}
          videoUrl={videoUrl}
          videoId={videoId}
          title={title}
          provider={provider}
          onEnded={handleEnded}
          chapters={videoChapters}
          onProgress={handleProgress}
        />
        <div className="p-6 bg-white border-t border-slate-50">
          <h2 className="text-xl font-black text-slate-900 mb-2">{title}</h2>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><BookOpen size={14} className="text-indigo-600" /> Professional Course</span>
            <span className="flex items-center gap-1.5"><FileText size={14} className="text-emerald-600" /> Interactive Transcript Enabled</span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1 h-[600px] lg:h-auto border-t lg:border-t-0 border-l border-slate-100">
        <InteractiveTranscript
          transcript={mockTranscript}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>
    </div>
  );
}
