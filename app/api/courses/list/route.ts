import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const courses = await db
            .collection('courses')
            .find({})
            .project({ title: 1, slug: 1, _id: 1 })
            .sort({ title: 1 })
            .toArray();

        const formattedCourses = courses.map((c) => ({
            id: c._id.toString(),
            title: c.title,
            slug: c.slug,
        }));

        return NextResponse.json({ courses: formattedCourses });
    } catch (error: any) {
        console.error('Course list fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch courses' },
            { status: 500 }
        );
    }
}
