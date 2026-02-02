import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CourseServiceNeon } from '@/lib/course-service-neon';
import { requireAdmin } from '@/lib/admin-check';
import { recordContentVersion } from '@/lib/workflow';
import { isValidStatus } from '@/lib/workflow-status';

export const runtime = 'nodejs';

// GET - Get course by slug (from Neon)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { slug } = await params;
    const course = await CourseServiceNeon.getCourseBySlug(slug);

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Adapt Neon naming (updated_at) to Mongo naming (updatedAt) if needed by UI
    return NextResponse.json({
      ...course,
      units: course.curriculum, // UI expects .units
      createdAt: course.created_at,
      updatedAt: course.updated_at
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch course', message: e.message }, { status: 500 });
  }
}

// PUT - Update course (in Neon)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { slug } = await params;
    const body = await req.json();
    const {
      title,
      categoryId,
      summary,
      subject,
      level,
      units,
      language,
      tags,
      resources,
      seo,
      metadata,
      price,
      thumbnail,
      status,
      changeNote,
    } = body;

    const existing = await CourseServiceNeon.getCourseBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const updateData: any = {
      title: title || existing.title,
      slug: title ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : existing.slug,
      categoryId: categoryId !== undefined ? categoryId : existing.category_id,
      summary: summary !== undefined ? summary : existing.summary,
      subject: subject || existing.subject,
      level: level || existing.level,
      language: language || existing.language,
      tags: Array.isArray(tags) ? tags : (existing.tags || []),
      curriculum: units || existing.curriculum,
      resources: resources || existing.resources,
      seo: seo || existing.seo,
      metadata: metadata || existing.metadata,
      price: price || existing.price,
      thumbnail: thumbnail !== undefined ? thumbnail : existing.thumbnail,
      status: status || existing.status,
    };

    if (status && !isValidStatus(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await CourseServiceNeon.updateCourse(existing.id, updateData);

    // Sync Live Rooms
    if (updated && updated.curriculum) {
      try {
        const { syncLiveRooms } = await import('@/lib/live-sync');
        await syncLiveRooms(updated.id.toString(), updated.curriculum);
      } catch (err) {
        console.error('Failed to sync live rooms', err);
      }
    }

    if (updated) {
      await recordContentVersion({
        contentType: 'course',
        contentId: slug,
        status: updated.status || 'draft',
        snapshot: updated,
        changeNote: changeNote || (status ? `Status changed to ${status}` : undefined),
        changedBy: userId,
      });
    }

    return NextResponse.json({ success: true, message: 'Course updated successfully', course: updated });
  } catch (e: any) {
    console.error('Update failed:', e);
    return NextResponse.json({ error: 'Failed to update course', message: e.message }, { status: 500 });
  }
}

// DELETE - Delete course (from Neon)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { slug } = await params;
    const existing = await CourseServiceNeon.getCourseBySlug(slug);

    if (!existing) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    await CourseServiceNeon.deleteCourse(existing.id);

    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete course', message: e.message }, { status: 500 });
  }
}

