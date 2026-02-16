'use client';

import Script from 'next/script';
import { useEffect } from 'react';

interface GoogleAdsenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
  fullWidthResponsive?: boolean;
  className?: string;
}

export function GoogleAdsense({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = ''
}: GoogleAdsenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, []);

  return (
    <>
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8149507764464883"
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      <ins
        className={`adsbygoogle ${className}`}
        style={{
          display: 'block',
          minHeight: adFormat === 'horizontal' ? '90px' : 'auto'
        }}
        data-ad-client="ca-pub-8149507764464883"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </>
  );
}
