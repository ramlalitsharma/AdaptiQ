import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { Course } from '@/lib/models/Course';
import { generateCourseOutlineAI, GenerateCourseParams } from '@/lib/course-generation';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
      const { requireAdmin } = await import('@/lib/admin-check');
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

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

    const db = await getDatabase();
    const col = db.collection<Course>('courses');

    let course: Course | null = null;

    const metadata: Course['metadata'] = {
      audience,
      goals,
      tone,
      unitsCount: unitsCount ? Number(unitsCount) : undefined,
      lessonsCount: lessonsPerChapter ? Number(lessonsPerChapter) : undefined,
    };

    if (mode === 'manual') {
      if (!title || !units) return NextResponse.json({ error: 'title and units required' }, { status: 400 });
      course = buildCourseFromHierarchy({
        authorId: userId,
        title,
        categoryId,
        subject,
        level,
        units,
        summary,
        metadata,
        language,
        tags,
        resources,
        price,
        seo,
        thumbnail,
      });
    } else {
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
      course = buildCourseFromHierarchy({
        authorId: userId,
        title,
        categoryId,
        subject,
        level,
        units: generated.modules.map((m: any) => ({
          title: m.title,
          chapters: [{
            title: 'Basics',
            lessons: m.lessons.map((l: any) => ({
              title: l.title,
              content: l.content,
              contentType: 'text'
            }))
          }]
        })),
        summary,
        metadata,
        language,
        tags,
        resources,
        price,
        seo,
        thumbnail,
      });
    }

    await col.insertOne(course);

    // Sync Live Rooms
    if (course.units) {
      try {
        const { syncLiveRooms } = await import('@/lib/live-sync');
        // Course _id is technically ObjectId, need to handle that if inserted
        const courseId = (course as any)._id?.toString() || (course as any).insertedId?.toString();
        if (courseId) {
          await syncLiveRooms(courseId, course.units);
        }
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

function buildCourseFromHierarchy({
  authorId,
  title,
  categoryId,
  subject,
  level,
  units,
  summary,
  metadata,
  language,
  tags,
  resources,
  price,
  seo,
  thumbnail,
}: {
  authorId: string;
  title: string;
  categoryId?: string;
  subject?: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  units: any[];
  summary?: string;
  metadata?: Course['metadata'];
  language?: string;
  tags?: string[];
  resources?: Course['resources'];
  price?: Course['price'];
  seo?: Course['seo'];
  thumbnail?: string;
}): Course {
  const now = new Date().toISOString();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const formattedUnits = units.map((u: any, ui: number) => ({
    id: `u${ui + 1}`,
    title: u.title || `Unit ${ui + 1}`,
    slug: (u.title || `unit-${ui + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    order: ui,
    chapters: (u.chapters || []).map((c: any, ci: number) => ({
      id: `u${ui + 1}-c${ci + 1}`,
      title: c.title || `Chapter ${ci + 1}`,
      slug: (c.title || `chapter-${ci + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      order: ci,
      lessons: (c.lessons || []).map((l: any, li: number) => ({
        id: `u${ui + 1}-c${ci + 1}-l${li + 1}`,
        title: l.title || `Lesson ${li + 1}`,
        slug: (l.title || `lesson-${li + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        contentType: l.contentType || 'text',
        content: l.content,
        videoUrl: l.videoUrl,
        liveRoomId: l.liveRoomId,
        liveRoomConfig: l.liveRoomConfig,
        order: li,
        order: li,
      })),
    })),
  }));

  return {
    authorId,
    categoryId,
    title,
    slug,
    summary,
    subject,
    level,
    language,
    tags,
    units: formattedUnits as any,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    metadata,
    resources,
    price,
    seo,
    thumbnail,
  };
}
