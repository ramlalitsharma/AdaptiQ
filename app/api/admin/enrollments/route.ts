import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializeEnrollment } from '@/lib/models/Enrollment';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const admin = await isAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const enrollments = await db
      .collection('enrollments')
      .find({})
      .sort({ requestedAt: -1 })
      .limit(200)
      .toArray();

    // gather related user and course info
    const userIds = Array.from(new Set(enrollments.map((e: any) => e.userId).filter(Boolean)));
    const courseIds = Array.from(new Set(enrollments.map((e: any) => e.courseId).filter(Boolean)));

    const [users, courses] = await Promise.all([
      db.collection('users').find({ $or: [{ clerkId: { $in: userIds } }, { _id: { $in: userIds } }] }).toArray(),
      db.collection('courses').find({ $or: [{ _id: { $in: courseIds } }, { slug: { $in: courseIds } }] }).toArray(),
    ]);

    const userMap = new Map<string, any>();
    users.forEach((user: any) => {
      if (user.clerkId) userMap.set(user.clerkId, user);
      if (user._id) userMap.set(String(user._id), user);
    });

    const courseMap = new Map<string, any>();
    courses.forEach((course: any) => {
      if (course._id) courseMap.set(String(course._id), course);
      if (course.slug) courseMap.set(course.slug, course);
    });

    const response = enrollments.map((enrollment: any) => {
      const serialized = serializeEnrollment(enrollment);
      const user = userMap.get(enrollment.userId) || {};
      const course = courseMap.get(enrollment.courseId) || {};

      return {
        ...serialized,
        userName: user.name || user.fullName || user.email || 'Unknown user',
        userEmail: user.email || '',
        userId: enrollment.userId,
        courseTitle: serialized.courseTitle || course.title || 'Course',
        courseSlug: serialized.courseSlug || course.slug || '',
        courseId: enrollment.courseId,
      };
    });

    return NextResponse.json({ enrollments: response });
  } catch (error: any) {
    console.error('Admin enrollments fetch error:', error);
    return NextResponse.json({ error: 'Failed to load enrollments', message: error.message }, { status: 500 });
  }
}
