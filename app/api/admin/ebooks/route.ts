import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const { title, audience, tone, chapters, focus, outline, releaseAt, tags, seo } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const ebook = await prisma.ebook.create({
      data: {
        authorId: userId,
        title,
        audience: audience || null,
        tone: tone || null,
        focus: focus || null,
        chapters: Array.isArray(outline?.chapters) ? outline.chapters : [],
        requestedChapters: chapters ? Number(chapters) : null,
        tags: Array.isArray(tags) ? tags : [],
        releaseAt: releaseAt ? new Date(releaseAt) : null,
        seo: seo || null,
        coverImageUrl: null,
      },
      select: { id: true },
    });
    return NextResponse.json({ success: true, ebookId: ebook.id });
  } catch (error: any) {
    console.error('Ebook create error:', error);
    return NextResponse.json({ error: 'Failed to create ebook', message: error.message }, { status: 500 });
  }
}
