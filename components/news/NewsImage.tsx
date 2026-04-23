'use client';

import { useState } from 'react';
import Image from 'next/image';

interface NewsImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function NewsImage({
  src,
  alt,
  className,
  fallbackSrc = '/news-placeholder.jpg',
  ...props
}: NewsImageProps) {
  const [error, setError] = useState(false);

  // Robust path detection
  const isValidSrc = src && typeof src === 'string' && src.length > 5;
  const showFallback = error || !isValidSrc;
  const imageSrc = showFallback ? fallbackSrc : (src as string);
  const shouldSkipOptimization =
    typeof imageSrc === 'string' &&
    (imageSrc.startsWith('/uploads') || /^https?:\/\//i.test(imageSrc));

  return (
    <div className={`relative overflow-hidden bg-[#0a0a0b] group ${className || ''}`}>
      <Image
        src={imageSrc}
        alt={alt || 'News Image'}
        fill
        className={`object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${error ? 'opacity-50 grayscale' : 'opacity-100'}`}
        onError={() => {
          console.warn(`[NewsImage] Image recovery initiated for: ${src}`);
          setError(true);
        }}
        unoptimized={shouldSkipOptimization}
        {...props}
      />
      
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
      
      {error && !src?.startsWith('data:image/') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/40 backdrop-blur-[2px]">
          <div className="w-8 h-[1px] bg-zinc-700 mb-2" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Terai Bureau
          </span>
        </div>
      )}
    </div>
  );
}
