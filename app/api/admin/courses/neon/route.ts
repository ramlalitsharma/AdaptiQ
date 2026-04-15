import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-check';
import { CourseServiceNeon } from '@/lib/course-service-neon';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId || !(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const body = await req.json();
        const result = await CourseServiceNeon.createCourse({
            ...body,
            authorId: userId
        });

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('Neon Course Create Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
