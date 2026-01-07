import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roomId } = await req.json();
        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const db = await getDatabase();

        // Find the room to verify ownership
        const room = await db.collection('liveRooms').findOne({ roomId });
        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Only creator or admin can end the room
        // TODO: Add proper admin role check if needed, for now creator check
        if (room.createdBy !== userId) {
            // Also allow if user is admin (you might need your isAdmin check here)
            // const isUserAdmin = await isAdmin();
            // if (!isUserAdmin) return ...
            // For now, strict on creator
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const now = new Date();

        // Update status to 'ended'
        await db.collection('liveRooms').updateOne(
            { roomId },
            {
                $set: {
                    status: 'ended',
                    actualEndTime: now,
                    updatedAt: now
                }
            }
        );

        return NextResponse.json({ success: true, message: 'Class ended successfully' });
    } catch (error: any) {
        console.error('End class error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
