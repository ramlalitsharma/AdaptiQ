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

  const showFallback = error || !src;

  return (
    <div className={`relative ${className || ''}`}>
      <Image
        src={showFallback ? fallbackSrc : (src as string)}
        alt={alt || 'News Image'}
        fill
        className="object-cover"
        onError={() => setError(true)}
        unoptimized
        {...props}
      />
    </div>
  );
}
