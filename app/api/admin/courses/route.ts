import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CourseServiceNeon } from '@/lib/course-service-neon';
import { generateCourseOutlineAI } from '@/lib/course-generation';
import { requireAdmin } from '@/lib/admin-check';

export const runtime = 'nodejs';

// GET - List all courses (from Neon)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await requireAdmin();
    const courses = await CourseServiceNeon.getAllCourses();
    return NextResponse.json({ courses });
  } catch (e: any) {
    console.error('Fetch courses failed:', e);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST - Create a new course (to Neon)
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const body = await req.json();
    const {
      mode,
      title,
      categoryId,
      subject,
      level,
      units,
      summary,
      audience,
      goals,
      tone,
      unitsCount,
      lessonsPerChapter,
      language,
      tags,
      resources,
      price,
      seo,
      thumbnail,
    } = body as any;

    let finalUnits = units || [];

    if (mode === 'ai') {
      if (!title) return NextResponse.json({ error: 'title required for AI mode' }, { status: 400 });
      const generated = await generateCourseOutlineAI({
        title,
        subject,
        level,
        audience,
        goals,
        tone,
        modulesCount: unitsCount,
        lessonsPerModule: lessonsPerChapter,
      });

      finalUnits = (generated.modules || []).map((m: any, mi: number) => ({
        id: `u${mi + 1}`,
        title: m.title,
        chapters: [{
          title: 'Core Concepts',
          lessons: (m.lessons || []).map((l: any, li: number) => ({
            id: `u${mi + 1}-l${li + 1}`,
            title: l.title,
            content: l.content || 'Content coming soon...',
            contentType: 'text'
          }))
        }]
      }));
    }

    const courseData = {
      authorId: userId,
      categoryId,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      summary,
      subject,
      level,
      language: language || 'English',
      tags: Array.isArray(tags) ? tags : (tags?.split(',').map((t: string) => t.trim()) || []),
      curriculum: finalUnits,
      status: 'draft',
      price: price || { currency: 'USD', amount: 0 },
      seo: seo || {},
      metadata: { audience, goals, tone },
      resources: resources || [],
      thumbnail
    };

    const course = await CourseServiceNeon.createCourse(courseData);

    // Sync Live Rooms (Optional background task)
    if (finalUnits.length > 0) {
      try {
        const { syncLiveRooms } = await import('@/lib/live-sync');
        await syncLiveRooms(course.id, finalUnits);
      } catch (err) {
        console.error('Failed to sync live rooms', err);
      }
    }

    return NextResponse.json({ course });
  } catch (e: any) {
    console.error('Create course failed:', e);
    return NextResponse.json({ error: 'Failed to create course', message: e.message }, { status: 500 });
  }
}
