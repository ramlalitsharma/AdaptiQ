import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const init = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: await req.text(),
  } as RequestInit;
  const upstream = await fetch('https://subnp.com/api/free/generate', init);
  // Stream back SSE
  const headers = new Headers(upstream.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers });
}


