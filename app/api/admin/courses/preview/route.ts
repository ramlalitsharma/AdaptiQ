import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { generateCourseOutlineAI } from '@/lib/course-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await requireAdmin();

    const body = await req.json();
    const outline = await generateCourseOutlineAI(body);
    return NextResponse.json({ outline });
  } catch (error: any) {
    console.error('Course preview generate error:', error);
    return NextResponse.json({ error: 'Failed to generate outline preview', message: error.message }, { status: 500 });
  }
}
