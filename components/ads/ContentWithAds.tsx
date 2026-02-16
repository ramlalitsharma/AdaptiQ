'use client';

import { ReactNode } from 'react';
import { GoogleAdsense } from './GoogleAdsense';

interface ContentWithAdsProps {
  children: ReactNode;
  isPro?: boolean;
  type?: 'blog' | 'news' | 'article';
  numberOfAds?: number; // Default 2
}

/**
 * Content Wrapper with Automatic In-Content Ads
 * Intelligently injects ads between content sections
 * Use this to wrap long-form content (blog posts, news articles, etc)
 */
export function ContentWithAds({
  children,
  isPro = false,
  type = 'article',
  numberOfAds = 2,
}: ContentWithAdsProps) {
  if (!children) return null;

  // Convert children to array for processing
  const childrenArray = Array.isArray(children) ? children : [children];

  // Calculate where to insert ads (distribute evenly)
  const adPositions = new Set<number>();
  if (numberOfAds > 0 && childrenArray.length > 0) {
    const step = Math.ceil(childrenArray.length / (numberOfAds + 1));
    for (let i = 1; i <= numberOfAds; i++) {
      adPositions.add(i * step);
    }
  }

  return (
    <article className="max-w-4xl mx-auto">
      {childrenArray.map((child, index) => {
        const showAd = adPositions.has(index) && !isPro;

        return (
          <div key={index}>
            {/* Content */}
            <div className="mb-8">{child}</div>

            {/* In-Content Ad */}
            {showAd && (
              <div className="flex justify-center my-12 py-8 border-y border-white/10">
                <GoogleAdsense
                  adSlot="9337411181"
                  adFormat="rectangle"
                  className="max-w-md"
                />
              </div>
            )}
          </div>
        );
      })}
    </article>
  );
}
