import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import OpenAI from 'openai';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const topicPrompt = 'Suggest a trending educational topic suitable for students preparing for exams. Return only the topic title.';
    const topicResp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: topicPrompt }],
      temperature: 0.7,
    });
    const title = topicResp.choices[0]?.message?.content?.trim() || 'Learning Strategies';

    const blogResp = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'You are an expert education writer. Produce factual, helpful content with headings and lists.' },
        { role: 'user', content: `Write a 900-1200 word detailed blog on: ${title}. Include intro, numbered steps, examples, and a conclusion. Return Markdown.` },
      ],
      temperature: 0.7,
    });
    const markdown = blogResp.choices[0]?.message?.content || '';

    // Generate image via subnp free image generation (streamed)
    let imageUrl: string | undefined;
    try {
      const genRes = await fetch('https://subnp.com/api/free/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `Cover image for blog: ${title}, modern educational theme`, model: 'turbo' }),
      });

      const decoder = new TextDecoder();
      const reader = genRes.body?.getReader();
      if (reader) {
        let done = false;
        let buffer = '';
        while (!done) {
          const { value, done: d } = await reader.read();
          done = d;
          if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              try {
                const data = JSON.parse(line.slice(6));
                if (data.status === 'complete' && data.imageUrl) {
                  imageUrl = data.imageUrl;
                }
              } catch {}
            }
          }
        }
      }
    } catch {}

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const db = await getDatabase();
    await db.collection('blogs').insertOne({ title, slug, markdown, imageUrl, createdAt: now, expiresAt });

    return NextResponse.json({ ok: true, slug });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed', message: e.message }, { status: 500 });
  }
}


