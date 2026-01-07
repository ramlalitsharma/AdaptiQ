import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { generateCourseOutlineAI } from '@/lib/course-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const { title, mode, courseType, defaultLiveRoomId, unitsCount, lessonsPerChapter } = body as {
      title: string;
      mode?: 'curriculum' | 'professional';
      courseType?: 'video' | 'live';
      defaultLiveRoomId?: string;
      unitsCount?: number;
      lessonsPerChapter?: number;
    };

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const outline = await generateCourseOutlineAI({ title, modulesCount: unitsCount, lessonsPerModule: lessonsPerChapter });

    // Map modules -> units; chunk lessons into chapters with 3-4 lessons per chapter
    const chunkSize = Math.max(3, Math.min(6, Number(lessonsPerChapter) || 4));
    const units = (outline.modules || []).map((m: any) => {
      const lessonsArr = Array.isArray(m.lessons) ? m.lessons : [];
      const chapters: any[] = [];
      for (let i = 0; i < lessonsArr.length; i += chunkSize) {
        const group = lessonsArr.slice(i, i + chunkSize);
        chapters.push({
          title:
            mode === 'professional'
              ? `Project Phase ${Math.floor(i / chunkSize) + 1}`
              : i === 0
              ? 'Basics'
              : i < chunkSize * 2
              ? 'Intermediate'
              : 'Advanced',
          lessons: group.map((l: any) => ({
            title: l.title,
            content: l.content,
            contentType: courseType === 'live' ? 'live' : 'text',
            videoUrl: '',
            liveRoomId: courseType === 'live' ? defaultLiveRoomId || '__CREATE_NEW__' : undefined,
          })),
        });
      }
      // Ensure at least one chapter even if no lessons
      if (chapters.length === 0) {
        chapters.push({
          title: 'Overview',
          lessons: [
            {
              title: 'Introduction',
              content: m.summary || '',
              contentType: courseType === 'live' ? 'live' : 'text',
              videoUrl: '',
              liveRoomId: courseType === 'live' ? defaultLiveRoomId || '__CREATE_NEW__' : undefined,
            },
          ],
        });
      }
      return {
        title: m.title,
        chapters,
      };
    });

    return NextResponse.json({ units });
  } catch (error: any) {
    console.error('Curriculum generation error:', error);
    return NextResponse.json({ error: 'Failed to generate curriculum', message: error.message }, { status: 500 });
  }
}
