import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/navigation';

const intlMiddleware = createMiddleware(routing);

/**
 * High-Performance Geo-IP Language Mapping
 * Synchronizes the platform's linguistic layer with the user's physical region.
 */
const countryToLocale: Record<string, string> = {
  IN: 'hi', // India -> Hindi
  MY: 'ms', // Malaysia -> Malay
  BD: 'bn', // Bangladesh -> Bengali
  PK: 'ur', // Pakistan -> Urdu
  SA: 'ar', // Saudi Arabia -> Arabic
  AE: 'ar', // UAE -> Arabic
  EG: 'ar', // Egypt -> Arabic
  CN: 'zh', // China -> Chinese
  HK: 'zh', // Hong Kong -> Chinese
  JP: 'ja', // Japan -> Japanese
  KR: 'ko', // South Korea -> Korean
  TR: 'tr', // Turkey -> Turkish
  VN: 'vi', // Vietnam -> Vietnamese
  RU: 'ru', // Russia -> Russian
  FR: 'fr', // France -> French
  DE: 'de', // Germany -> German
  IT: 'it', // Italy -> Italian
  ES: 'es', // Spain -> Spanish
  MX: 'es', // Mexico -> Spanish
  AR: 'es', // Argentina -> Spanish
  PT: 'pt', // Portugal -> Portuguese
  BR: 'pt', // Brazil -> Portuguese
  ID: 'id', // Indonesia -> Indonesian
  NP: 'ne', // Nepal -> Nepali
};

const isProtectedRoute = createRouteMatcher([
    '/:locale/dashboard(.*)',
    '/:locale/quiz(.*)',
    '/:locale/admin(.*)',
    '/:locale/analytics(.*)',
    '/:locale/settings(.*)',
]);

function addSecurityHeaders(response: NextResponse) {
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.refectl.com https://refectl.com https://www.refectl.com https://cdn.jsdelivr.net https://*.meet.jit.si https://pagead2.googlesyndication.com https://adservice.google.com https://va.vercel-scripts.com https://www.googletagmanager.com https://app.posthog.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
        "font-src 'self' https://fonts.gstatic.com data:",
        "img-src 'self' data: https: blob: https://*.clerk.com https://img.clerk.com https://pagead2.googlesyndication.com https://www.google-analytics.com",
        "connect-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.refectl.com https://clerk-telemetry.com https://api.openai.com https://*.openai.com wss://*.clerk.com https://*.meet.jit.si wss://*.meet.jit.si https://*.jitsi.net https://va.vercel-scripts.com https://vitals.vercel-analytics.com https://www.google-analytics.com https://app.posthog.com https://refectl.com https://www.refectl.com https://cdn.jsdelivr.net",
        "frame-src 'self' https://*.clerk.com https://*.clerk.accounts.dev https://clerk.refectl.com https://*.meet.jit.si https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
        "media-src 'self' https://*.meet.jit.si https://*.jitsi.net",
        "worker-src 'self' blob:",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
        "upgrade-insecure-requests",
    ].join('; ');

    response.headers.set('X-DNS-Prefetch-Control', 'on');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('Permissions-Policy', 'camera=(self "https://meet.jit.si" "https://*.meet.jit.si"), microphone=(self "https://meet.jit.si" "https://*.meet.jit.si"), geolocation=()');
    
    // Add caching hints for localized static content to improve global performance
    const pathname = response.headers.get('x-next-intl-locale') ? 'localized' : 'default';
    if (pathname === 'localized' && !response.headers.has('Cache-Control')) {
        response.headers.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    }

    response.headers.delete('X-Powered-By');
    return response;
}

export default clerkMiddleware(async (auth, req) => {
    const start = Date.now();
    const { pathname } = req.nextUrl;

    // Skip middleware for static files and internal APIs
    if (
        pathname === '/sitemap.xml' ||
        pathname === '/sitemap.txt' ||
        pathname === '/robots.txt' ||
        pathname === '/ads.txt' ||
        pathname === '/app-ads.txt' ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/_static') ||
        pathname.startsWith('/_vercel')
    ) {
        return NextResponse.next();
    }

    // Phase 44: Strategic Geo-Intelligence Redirection
    // If the path is locale-less, we determine the best entry point via Edge headers
    const pathnameIsMissingLocale = routing.locales.every(
      (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
      const country = req.headers.get('x-vercel-ip-country') || 'US';
      const detectedLocale = countryToLocale[country];

      if (detectedLocale && detectedLocale !== routing.defaultLocale) {
        const url = new URL(req.url);
        url.pathname = `/${detectedLocale}${pathname === '/' ? '' : pathname}`;
        return NextResponse.redirect(url);
      }
    }

    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    const response = intlMiddleware(req);
    const finalResponse = addSecurityHeaders(response);

    const duration = Date.now() - start;
    finalResponse.headers.set('X-Response-Time', `${duration}ms`);
    return finalResponse;
}, {
    authorizedParties: [
        'https://refectl.com',
        'https://www.refectl.com',
        'http://localhost:3000'
    ]
});

export const config = {
    matcher: [
        // Enable a redirect to a matching locale at the root
        '/',
        // Set locales in path
        '/(en|es|hi|zh|ja|ko|fr|de|it|pt|ru|ar|ur|ms|id|tr|vi|bn|he)/:path*',
        // Skip Next.js internals, static files, and root-level txt files (ads.txt, robots.txt, etc.)
        '/((?!api|_next|ads\\.txt|robots\\.txt|sitemap\\.xml|sitemap\\.txt|app-ads\\.txt|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};
