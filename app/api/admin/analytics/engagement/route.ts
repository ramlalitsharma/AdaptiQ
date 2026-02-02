import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const db = await getDatabase();

        // Fetch courses owned by this instructor
        const courses = await db.collection('courses').find({ instructorId: userId }).toArray();
        const courseIds = courses.map(c => String(c._id));

        // Aggregate enrollments
        const enrollmentsCount = await db.collection('enrollments').countDocuments({ courseId: { $in: courseIds } });

        // Aggregate completions
        const completionsCount = await db.collection('courseCompletions').countDocuments({ courseId: { $in: courseIds } });

        // Simulate engagement heatmap data (in a real app, this would be tracked in a 'videoRetention' collection)
        const engagementData = [
            { day: 'Mon', value: 45 },
            { day: 'Tue', value: 52 },
            { day: 'Wed', value: 38 },
            { day: 'Thu', value: 65 },
            { day: 'Fri', value: 48 },
            { day: 'Sat', value: 24 },
            { day: 'Sun', value: 31 },
        ];

        // Top performing courses
        const topCourses = courses.slice(0, 3).map(c => ({
            title: c.title,
            engagement: Math.floor(Math.random() * 40) + 60, // Simulated engagement score
            students: Math.floor(Math.random() * 100) + 20
        }));

        return NextResponse.json({
            stats: {
                totalEnrollments: enrollmentsCount,
                totalCompletions: completionsCount,
                averageEngagement: 74, // Simulated
            },
            engagementData,
            topCourses
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
