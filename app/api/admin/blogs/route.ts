import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { generateBlogMarkdownAI } from '@/lib/blog-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      mode,
      title,
      topic,
      markdown,
      audience,
      tone,
      callToAction,
      keywords,
      tags,
      heroImage,
      seo,
      status,
      resources,
    } = body as {
      mode: 'ai' | 'manual';
      title?: string;
      topic?: string;
      markdown?: string;
      audience?: string;
      tone?: string;
      callToAction?: string;
      keywords?: string[];
      tags?: string[];
      heroImage?: string;
      seo?: { title?: string; description?: string };
      status?: string;
      resources?: Array<{ type: 'link' | 'image' | 'pdf' | 'video'; label: string; url: string }>;
    };

    const db = await getDatabase();
    const col = db.collection('blogs');

    let doc: any = null;

    const metadata = {
      audience,
      tone,
      callToAction,
      keywords,
      tags,
      heroImage,
    };

    if (mode === 'manual') {
      if (!title || !markdown) return NextResponse.json({ error: 'title and markdown required' }, { status: 400 });
      doc = buildBlog(userId, title, markdown, metadata, seo, status, resources);
    } else {
      const t = topic || title;
      if (!t) return NextResponse.json({ error: 'title or topic required for AI mode' }, { status: 400 });
      const generatedMarkdown = await generateBlogMarkdownAI({ topic: t, audience, tone, callToAction, keywords });
      doc = buildBlog(userId, title || t, generatedMarkdown, metadata, seo, status, resources);
    }

    await col.insertOne(doc);
    return NextResponse.json({ blog: doc });
  } catch (e: any) {
    console.error('Create blog failed:', e);
    return NextResponse.json({ error: 'Failed to create blog', message: e.message }, { status: 500 });
  }
}

function buildBlog(
  authorId: string,
  title: string,
  markdown: string,
  metadata?: any,
  seo?: { title?: string; description?: string },
  status?: string,
  resources?: Array<{ type: 'link' | 'image' | 'pdf' | 'video'; label: string; url: string }>,
) {
  const now = new Date();
  return {
    authorId,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    markdown,
    createdAt: now,
    updatedAt: now,
    status: (status as any) || 'draft',
    metadata,
    seo,
    resources,
  };
}


