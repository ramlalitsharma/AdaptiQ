import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/auth';

// Get instructor's classes (upcoming and live)
export async function GET(req: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const now = new Date();

        // Get live classes
        const liveClasses = await db
            .collection('liveRooms')
            .find({ status: 'live' })
            .sort({ scheduledTime: 1 })
            .toArray();

        // Get upcoming classes (scheduled for future)
        const upcomingClasses = await db
            .collection('liveRooms')
            .find({
                status: 'scheduled',
                scheduledTime: { $gte: now },
            })
            .sort({ scheduledTime: 1 })
            .limit(10)
            .toArray();

        // Enrich with course titles
        const enrichClasses = async (classes: any[]) => {
            const courseIds = [...new Set(classes.map(c => c.courseId))];
            const courses = await db
                .collection('courses')
                .find({ _id: { $in: courseIds.map(id => id) } })
                .toArray();

            const courseMap = new Map(courses.map(c => [String(c._id), c.title]));

            return classes.map(cls => ({
                ...cls,
                _id: String(cls._id),
                courseTitle: courseMap.get(cls.courseId) || 'Unknown Course',
            }));
        };

        const [enrichedLive, enrichedUpcoming] = await Promise.all([
            enrichClasses(liveClasses),
            enrichClasses(upcomingClasses),
        ]);

        return NextResponse.json({
            live: enrichedLive,
            upcoming: enrichedUpcoming,
        });
    } catch (error) {
        console.error('Error fetching instructor classes:', error);
        return NextResponse.json(
            { error: 'Failed to fetch classes' },
            { status: 500 }
        );
    }
}
