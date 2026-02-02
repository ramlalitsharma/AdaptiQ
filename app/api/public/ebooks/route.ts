import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    const tag = (url.searchParams.get('tag') || '').trim();
    const limit = Number(url.searchParams.get('limit') || 24);

    const where: any = {};
    if (q) where.title = { contains: q, mode: 'insensitive' };
    if (tag) where.tags = { has: tag };
    const ebooks = await prisma.ebook.findMany({
      where,
      select: { id: true, title: true, tags: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: Math.max(1, Math.min(100, limit)),
    });

    const items = ebooks.map((e: { id: any; title: any; tags: any; updatedAt: any; }) => ({
      id: e.id,
      title: e.title || '',
      tags: Array.isArray(e.tags) ? e.tags : [],
      updatedAt: e.updatedAt || null,
    }));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('Public ebooks list error:', error);
    return NextResponse.json({ error: 'Failed to load ebooks' }, { status: 500 });
  }
}
