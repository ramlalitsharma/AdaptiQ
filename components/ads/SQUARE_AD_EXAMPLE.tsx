// Example: How to add the square ad in the middle of your pages

import { GoogleAdsense } from '@/components/ads/GoogleAdsense';

export default function ExamplePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-elite-bg py-16">
      <div className="container mx-auto px-4">
        
        {/* TOP SECTION */}
        <div className="mb-12">
          <h1 className="text-5xl font-black mb-4">Page Title</h1>
          <p>Your content here...</p>
        </div>

        {/* MIDDLE - SQUARE AD (9337411181) */}
        {!isPro && (
          <div className="flex justify-center my-12">
            <div className="w-full max-w-md">
              <GoogleAdsense 
                adSlot="9337411181"
                adFormat="rectangle"
                className="mx-auto"
              />
            </div>
          </div>
        )}

        {/* BOTTOM SECTION */}
        <div className="mt-12">
          <p>More content below the ad...</p>
        </div>

      </div>
    </div>
  );
}
