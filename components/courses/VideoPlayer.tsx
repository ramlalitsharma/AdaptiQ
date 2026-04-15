'use client';


import { forwardRef } from 'react';
import { EnhancedVideoPlayer } from '@/components/video/EnhancedVideoPlayer';

interface VideoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  title?: string;
  provider?: 'youtube' | 'vimeo' | 'direct' | 'self-hosted' | 'hls';
  playbackId?: string; // For self-hosted HLS videos
  onEnded?: () => void;
  chapters?: Array<{ title: string; time: number }>;
}

export const VideoPlayer = forwardRef(({ videoUrl, videoId, title, provider = 'youtube', playbackId, onEnded, chapters }: VideoPlayerProps, ref) => {

  if (!videoUrl && !videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">📹</div>
          <p>No video available</p>
        </div>
      </div>
    );
  }

  if (provider === 'youtube' && videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?rel=0`}
          title={title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => { }}
        />
      </div>
    );
  }

  if (provider === 'vimeo' && videoId) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          title={title}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onError={() => { }}
        />
      </div>
    );
  }

  // Self-hosted HLS video
  if (provider === 'self-hosted' || provider === 'hls') {
    return (
      <EnhancedVideoPlayer
        ref={ref}
        playbackId={playbackId || videoId || ''}
        title={title}
        onEnded={onEnded}
        chapters={chapters}
      />
    );
  }

  if (videoUrl) {
    return (
      <EnhancedVideoPlayer
        ref={ref}
        playbackId={videoUrl}
        title={title}
        onEnded={onEnded}
        chapters={chapters}
      />
    );
  }
  return null;
});

VideoPlayer.displayName = 'VideoPlayer';
