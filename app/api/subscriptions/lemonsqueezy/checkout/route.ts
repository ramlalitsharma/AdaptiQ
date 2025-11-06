import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect(new URL('/sign-in', req.nextUrl));

    const user = await currentUser();

    const checkoutBase = process.env.LEMON_SQUEEZY_CHECKOUT_URL; // e.g., https://checkout.lemonsqueezy.com/buy/XXXXXX
    if (!checkoutBase) return NextResponse.json({ error: 'LEMON_SQUEEZY_CHECKOUT_URL not configured' }, { status: 500 });

    const url = new URL(checkoutBase);
    if (user?.email) url.searchParams.set('checkout[email]', user.email);
    // Optional: Add custom data to identify user
    url.searchParams.set('checkout[custom][user_id]', userId);

    return NextResponse.redirect(url);
  } catch (e: any) {
    console.error('Lemon checkout error:', e);
    return NextResponse.json({ error: 'Checkout failed', message: e.message }, { status: 500 });
  }
}


