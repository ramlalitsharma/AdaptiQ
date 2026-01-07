import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const body = await req.json();
        const { roomId, roomName, scheduledDate, scheduledTime, duration, courseId } = body;

        if (!roomId || !roomName) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const db = await getDatabase();

        const liveRoom = {
            roomId,
            roomName,
            courseId: courseId || 'pending', // Minimal required field
            lessonId: 'pending', // Will be linked later when course is saved
            scheduledTime: new Date(`${scheduledDate}T${scheduledTime}`),
            duration: duration || 90,
            status: 'scheduled',
            provider: 'jitsi',
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        await db.collection('liveRooms').updateOne(
            { roomId },
            { $set: liveRoom },
            { upsert: true }
        );

        return NextResponse.json({ success: true, roomId });

    } catch (error) {
        console.error('Error creating live room:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
