import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId } = params;
        const data = await req.json();

        const db = await getDatabase();

        // Update session with organization data
        const result = await db.collection('liveRooms').findOneAndUpdate(
            { _id: sessionId },
            {
                $set: {
                    summary: data.summary,
                    topicsCovered: data.topicsCovered,
                    keyTakeaways: data.keyTakeaways,
                    resources: data.resources || [],
                    curriculum: data.curriculum,
                    professional: data.professional,
                    organizedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            session: result.value,
        });
    } catch (error) {
        console.error('Error organizing session:', error);
        return NextResponse.json(
            { error: 'Failed to organize session' },
            { status: 500 }
        );
    }
}
