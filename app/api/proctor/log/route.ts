import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sessionId, event, metadata, timestamp } = await req.json();

        const db = await getDatabase();

        // Log the event to the proctorSessions collection
        await db.collection('proctorLogs').insertOne({
            userId,
            sessionId,
            event,
            metadata,
            timestamp: new Date(timestamp),
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent'),
            createdAt: new Date()
        });

        // Update or create the session summary
        await db.collection('proctorSessions').updateOne(
            { sessionId, userId },
            {
                $set: { lastActivity: new Date() },
                $inc: { [`eventCounts.${event}`]: 1 },
                $setOnInsert: {
                    startTime: new Date(),
                    status: 'active'
                }
            },
            { upsert: true }
        );

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Proctoring Log Error:', error);
        return NextResponse.json(
            { error: 'Failed to log event', message: error.message },
            { status: 500 }
        );
    }
}
