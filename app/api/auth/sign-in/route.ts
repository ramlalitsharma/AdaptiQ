import { NextRequest, NextResponse } from 'next/server';
import { luciaSignIn } from '@/lib/lucia';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if ((process.env.AUTH_PROVIDER || 'clerk').toLowerCase() !== 'lucia') {
      return NextResponse.json({ error: 'Lucia auth not enabled' }, { status: 400 });
    }
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'email and password required' }, { status: 400 });
    await luciaSignIn(email, password);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sign in failed' }, { status: 400 });
  }
}


