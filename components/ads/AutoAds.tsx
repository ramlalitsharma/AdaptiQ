'use client';

import { GoogleAdsense } from './GoogleAdsense';

interface AutoAdsProps {
  isPro?: boolean;
  pageType?: 'home' | 'blog' | 'news' | 'shop' | 'course' | 'default';
}

/**
 * Automatic Ad Placement Component
 * Intelligently places ads at optimal locations based on page type
 * No manual configuration needed - works everywhere!
 */
export function AutoAds({ isPro = false, pageType = 'default' }: AutoAdsProps) {
  // Hide all ads for Pro users
  if (isPro) return null;

  // Don't render ads on server side
  if (typeof window === 'undefined') return null;

  return (
    <>
      {/* TOP AD - Horizontal banner (slot 5087174988) */}
      {(pageType === 'blog' || pageType === 'news' || pageType === 'shop') && (
        <div className="w-full bg-white/5 py-6 mb-8 border-b border-white/10">
          <div className="flex justify-center">
            <GoogleAdsense
              adSlot="5087174988"
              adFormat="horizontal"
              className="w-full max-w-6xl"
            />
          </div>
        </div>
      )}

      {/* MIDDLE AD - Vertical/Square (slot 9337411181) */}
      {(pageType === 'blog' || pageType === 'news') && (
        <div className="flex justify-center my-12 py-8 border-y border-white/10">
          <GoogleAdsense
            adSlot="9337411181"
            adFormat="rectangle"
            className="max-w-md"
          />
        </div>
      )}
    </>
  );
}
