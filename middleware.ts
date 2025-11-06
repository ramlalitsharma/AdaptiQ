import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/quiz(.*)',
  '/admin(.*)',
  '/analytics(.*)',
  '/settings(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const provider = (process.env.AUTH_PROVIDER || 'clerk').toLowerCase();
  if (provider === 'clerk') {
    if (isProtectedRoute(req)) {
      await auth.protect();
    }
    return;
  }
  // Lucia mode: ensure session cookie exists; otherwise redirect to sign-in
  if (isProtectedRoute(req)) {
    const cookie = req.headers.get('cookie') || '';
    const hasSession = /adaptiq_session=/.test(cookie);
    if (!hasSession) {
      const url = new URL('/sign-in', req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
