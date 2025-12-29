import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin, getUserRole } from '@/lib/admin-check';
import { generateBlogMarkdownAI } from '@/lib/blog-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const role = await getUserRole();
    const isAllowed = role && ['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const markdown = await generateBlogMarkdownAI(body);
    return NextResponse.json({ markdown });
  } catch (error: any) {
    console.error('Blog preview generate error:', error);
    return NextResponse.json({ error: 'Failed to generate blog preview', message: error.message }, { status: 500 });
  }
}
