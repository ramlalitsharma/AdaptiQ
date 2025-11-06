import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDatabase();
    const progress = db.collection('userProgress');
    const courses = db.collection('courses');
    const certificates = db.collection('certificates');

    // Funnel: View → Start → Complete → Certificate
    const [viewedCourses, startedQuizzes, completedQuizzes, earnedCerts] = await Promise.all([
      // Viewed courses (approximate: users who accessed course pages)
      courses.countDocuments({ status: { $ne: 'draft' } }),
      // Started quizzes (progress entries)
      progress.countDocuments({ userId }),
      // Completed quizzes (score exists)
      progress.countDocuments({ userId, score: { $exists: true, $ne: null } }),
      // Certificates earned
      certificates.countDocuments({ userId }),
    ]);

    const funnel = {
      viewedCourses,
      startedQuizzes,
      completedQuizzes,
      earnedCerts,
      completionRate: startedQuizzes > 0 ? Math.round((completedQuizzes / startedQuizzes) * 100) : 0,
      certificateRate: completedQuizzes > 0 ? Math.round((earnedCerts / completedQuizzes) * 100) : 0,
    };

    return NextResponse.json(funnel);
  } catch (e: any) {
    console.error('Funnel analytics error:', e);
    return NextResponse.json({ error: 'Failed to fetch funnel', message: e.message }, { status: 500 });
  }
}

