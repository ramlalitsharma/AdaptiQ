import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/auth';

// Create a new live room
export async function POST(req: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId, roomName, scheduledDate, scheduledTime, duration } = await req.json();

        if (!courseId || !lessonId || !roomName || !scheduledDate || !scheduledTime) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const db = await getDatabase();

        // Generate unique room ID
        const roomId = `live-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Combine date and time
        const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);

        const liveRoom = {
            roomId,
            roomName,
            courseId,
            lessonId,
            scheduledTime: scheduledDateTime,
            duration: duration || 90,
            status: 'scheduled',
            createdAt: new Date(),
            recordingUrl: null,
            attendees: [],
            summary: null,
            topicsCovered: [],
            resources: [],
        };

        const result = await db.collection('liveRooms').insertOne(liveRoom);

        return NextResponse.json({
            success: true,
            room: {
                _id: result.insertedId,
                ...liveRoom,
            },
        });
    } catch (error) {
        console.error('Error creating live room:', error);
        return NextResponse.json(
            { error: 'Failed to create live room' },
            { status: 500 }
        );
    }
}

// Get all live rooms for a course
export async function GET(req: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ error: 'Course ID required' }, { status: 400 });
        }

        const db = await getDatabase();
        const rooms = await db
            .collection('liveRooms')
            .find({ courseId })
            .sort({ scheduledTime: -1 })
            .toArray();

        return NextResponse.json({ rooms });
    } catch (error) {
        console.error('Error fetching live rooms:', error);
        return NextResponse.json(
            { error: 'Failed to fetch live rooms' },
            { status: 500 }
        );
    }
}
