import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ roomId: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roomId } = await params;
        if (!roomId) {
            return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
        }

        const db = await getDatabase();

        // Attempt deletion by roomId (the string identifier)
        // Note: We search by the string roomId or the _id if it's a valid ObjectId
        const query = ObjectId.isValid(roomId)
            ? { $or: [{ roomId: roomId }, { _id: new ObjectId(roomId) }] }
            : { roomId: roomId };

        const result = await db.collection('liveRooms').deleteOne(query);

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Room deleted successfully' });
    } catch (error: any) {
        console.error('Live room deletion error:', error);
        return NextResponse.json(
            { error: 'Failed to delete room', message: error.message },
            { status: 500 }
        );
    }
}
