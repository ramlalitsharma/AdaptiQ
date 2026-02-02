import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, summary } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    if (!openai) {
      const fallback = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80';
      return NextResponse.json({ url: fallback });
    }

    const prompt = `Editorial news cover image for "${title}". Context: ${summary?.substring(0, 120) || title}. Style: photojournalism meets modern editorial, high contrast, cinematic lighting, world news tone, no text overlay, aspect 16:9.`;

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    });

    const url = response.data[0]?.url;
    if (!url) throw new Error('No image generated');

    return NextResponse.json({ url });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate thumbnail', message: error.message }, { status: 500 });
  }
}
