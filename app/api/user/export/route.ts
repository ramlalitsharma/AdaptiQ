import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();

    // Gather all user-related data
    const [user, enrollments, stats, activity, paths] = await Promise.all([
      db.collection('users').findOne({ clerkId: userId }),
      db.collection('enrollments').find({ userId }).toArray(),
      db.collection('userStats').findOne({ userId }),
      db.collection('activityFeed').find({ userId }).limit(100).toArray(),
      db.collection('learningPaths').find({ authorId: userId }).toArray()
    ]);

    const exportData = {
      profile: {
        id: user?.clerkId,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        createdAt: user?.createdAt
      },
      learningHistory: {
        totalEnrollments: enrollments.length,
        courses: enrollments.map(e => ({
          courseId: e.courseId,
          progress: e.progress,
          status: e.status,
          joinedAt: e.createdAt
        })),
        stats: stats || {}
      },
      content: {
        learningPathsCreated: paths.length,
        recentActivity: activity.map(a => ({
          type: a.type,
          content: a.content,
          date: a.createdAt
        }))
      },
      exportTimestamp: new Date().toISOString(),
      platform: "AdaptiQ LMS"
    };

    return NextResponse.json(exportData, {
      headers: {
        'Content-Disposition': `attachment; filename="adaptiq-data-export-${userId}.json"`,
        'Content-Type': 'application/json'
      }
    });

  } catch (error: any) {
    console.error('GDPR Export Error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', message: error.message },
      { status: 500 }
    );
  }
}
