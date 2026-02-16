'use client';

import Script from 'next/script';
import { useEffect } from 'react';

/**
 * Auto-responsive ad component optimized for content sections
 * Uses slot 5094089430 - Recommended for:
 * - Blog posts
 * - News articles
 * - Course content
 * - Between-content placements
 * - Recommended sections
 * - Landing pages
 * 
 * Placement: Between major content sections for maximum relevance
 * Format: Auto-responsive (adapts to container width)
 */

interface ContentAdProps {
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export function ContentAd({ className = '', label = '', showLabel = true }: ContentAdProps) {
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
    <div className={`my-8 ${className}`}>
      {showLabel && label && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold uppercase tracking-wider">
          {label}
        </p>
      )}
      <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8149507764464883"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <ins
          className={`adsbygoogle`}
          style={{
            display: 'block'
          }}
          data-ad-client="ca-pub-8149507764464883"
          data-ad-slot="5094089430"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
