import { NextRequest, NextResponse } from 'next/server';
import { luciaSignOut } from '@/lib/lucia';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    if ((process.env.AUTH_PROVIDER || 'clerk').toLowerCase() !== 'lucia') {
      return NextResponse.json({ error: 'Lucia auth not enabled' }, { status: 400 });
    }
    await luciaSignOut();
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Sign out failed' }, { status: 400 });
  }
}


