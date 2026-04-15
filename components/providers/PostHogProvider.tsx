'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { initializePostHog, trackPageView } from '@/lib/posthog-analytics';

function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (pathname) {
            let url = pathname;
            if (searchParams?.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            trackPageView(url);
        }
    }, [pathname, searchParams]);

    return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initializePostHog(
            process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
            {
                apiHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                capturePageViews: false, // We do this manually to handle client-side navigation correctly
            }
        );
    }, []);

    return (
        <>
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </>
    );
}
