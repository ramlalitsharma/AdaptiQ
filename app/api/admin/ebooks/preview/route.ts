import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { generateEbookOutlineAI, generateEbookDraftAI, generateEbookSEOAI, generateEbookChapterDraftAI } from '@/lib/ebook-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const mode = body?.mode === 'full' ? 'full' : body?.mode === 'seo' ? 'seo' : body?.mode === 'chapter' ? 'chapter' : 'outline';
    if (mode === 'seo') {
      const seo = await generateEbookSEOAI(body);
      return NextResponse.json({ seo });
    }
    if (mode === 'chapter') {
      const outline = await generateEbookChapterDraftAI(body);
      return NextResponse.json({ outline });
    }
    if (mode === 'full') {
      const outline = await generateEbookDraftAI(body);
      const seo = await generateEbookSEOAI(body);
      return NextResponse.json({ outline, seo });
    }
    const outline = await generateEbookOutlineAI(body);
    return NextResponse.json({ outline });
  } catch (error: any) {
    console.error('Ebook preview error:', error);
    return NextResponse.json({ error: 'Failed to generate ebook outline', message: error.message }, { status: 500 });
  }
}
