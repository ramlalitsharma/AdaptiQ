'use client';

import { useEffect } from 'react';

interface AdSlotProps {
  slotId: string;
  className?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'banner';
  enabled?: boolean;
}

/**
 * Google AdSense compliant ad slot. Renders only if NEXT_PUBLIC_ENABLE_ADS=true and client id is provided.
 * Ensure you have consent before enabling ads in the EU.
 */
export function AdSlot({ slotId, className = '', format = 'auto', enabled }: AdSlotProps) {
  const client = process.env.NEXT_PUBLIC_GOOGLE_ADS_CLIENT;
  const allowAds = enabled ?? (process.env.NEXT_PUBLIC_ENABLE_ADS === 'true');

  useEffect(() => {
    if (!allowAds || !client) return;
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // ignore
    }
  }, [allowAds, client, slotId]);

  if (!allowAds || !client) {
    return null;
  }

  return (
    <div className={className}>
      {/* eslint-disable-next-line */}
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}


