import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/admin-check';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        await requireAdmin();

        const { courseId } = await params;
        const db = await getDatabase();

        const result = await db.collection('courses').updateOne(
            { _id: new ObjectId(courseId), type: 'live-course' },
            { 
                $set: { 
                    type: 'video-course',
                    updatedAt: new Date()
                } 
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Live course not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('End live course error:', error);
        return NextResponse.json(
            { error: 'Failed to end live course', message: error.message },
            { status: 500 }
        );
    }
}
