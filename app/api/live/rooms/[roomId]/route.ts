import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const runtime = 'nodejs';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Next.js 15+ REQUIRES awaiting params
        const resolvedParams = await params;
        const { roomId } = resolvedParams;

        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const db = await getDatabase();

        // Search by roomId string or _id if valid ObjectId
        const query = ObjectId.isValid(roomId)
            ? { $or: [{ roomId: roomId }, { _id: new ObjectId(roomId) }] }
            : { roomId: roomId };

        const result = await db.collection('liveRooms').deleteOne(query);

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete room failed:', error);
        return NextResponse.json({
            error: 'Failed to delete',
            message: error.message
        }, { status: 500 });
    }
}
