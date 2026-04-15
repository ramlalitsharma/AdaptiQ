import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const doc = await prisma.ebook.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        audience: true,
        tone: true,
        focus: true,
        tags: true,
        releaseAt: true,
        updatedAt: true,
        coverImageUrl: true,
        chapters: true,
      },
    });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const ebook = {
      id: doc.id,
      title: doc.title || '',
      audience: doc.audience || '',
      tone: doc.tone || '',
      focus: doc.focus || '',
      tags: Array.isArray(doc.tags) ? doc.tags : [],
      releaseAt: doc.releaseAt || null,
      updatedAt: doc.updatedAt || null,
      coverImageUrl: doc.coverImageUrl || null,
      chapters: Array.isArray(doc.chapters)
        ? (doc.chapters as any[]).map((c: any) => ({
            title: c?.title || '',
            summary: c?.summary || '',
            keyTakeaways: Array.isArray(c?.keyTakeaways) ? c.keyTakeaways : [],
            resources: Array.isArray(c?.resources) ? c.resources : [],
            content: typeof c?.content === 'string' ? c.content : '',
          }))
        : [],
    };
    return NextResponse.json({ ebook });
  } catch (error: any) {
    console.error('Public ebook detail error:', error);
    return NextResponse.json({ error: 'Failed to load ebook' }, { status: 500 });
  }
}
