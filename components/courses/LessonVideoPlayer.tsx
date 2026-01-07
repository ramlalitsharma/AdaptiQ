'use client';

import { useState } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastManager';
import confetti from 'canvas-confetti';

interface LessonVideoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  title?: string;
  provider?: 'youtube' | 'vimeo' | 'direct' | 'self-hosted' | 'hls';
  courseSlug: string;
  lessonSlug: string; // Not used for API currently but good for tracking
}

export function LessonVideoPlayer({
  videoUrl,
  videoId,
  title,
  provider,
  courseSlug,
}: LessonVideoPlayerProps) {
  const router = useRouter();
  const [isCompleting, setIsCompleting] = useState(false);
  const { addToast } = useToast();

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

  return (
    <VideoPlayer
      videoUrl={videoUrl}
      videoId={videoId}
      title={title}
      provider={provider}
      onEnded={handleEnded}
    />
  );
}
