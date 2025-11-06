'use client';

import { useState } from 'react';

interface VideoPlayerProps {
  videoUrl?: string;
  videoId?: string;
  title?: string;
  provider?: 'youtube' | 'vimeo' | 'direct';
}

export function VideoPlayer({ videoUrl, videoId, title, provider = 'youtube' }: VideoPlayerProps) {
  const [error, setError] = useState(false);

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
          onError={() => setError(true)}
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
          onError={() => setError(true)}
        />
      </div>
    );
  }

  if (videoUrl) {
    return (
      <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
        <video
          src={videoUrl}
          controls
          className="w-full h-full"
          onError={() => setError(true)}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return null;
}

