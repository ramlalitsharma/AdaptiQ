import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createErrorResponse, createSuccessResponse } from '@/lib/error-handler';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse('Unauthorized', 'Unauthorized', 401);
    }

    const { roomId, status } = await req.json();

    if (!['active', 'ended'].includes(status)) {
      return createErrorResponse('Invalid status', 'Invalid status', 400);
    }

    const db = await getDatabase();
    
    // Verify ownership or admin status
    const room = await db.collection('liveRooms').findOne({ roomId });
    if (!room) {
      return createErrorResponse('Room not found', 'Room not found', 404);
    }

    if (room.createdBy !== userId) {
        // TODO: Add admin check here if needed
      return createErrorResponse('Forbidden', 'Only the instructor can update status', 403);
    }

    const updateData: any = { status };
    if (status === 'active') {
      updateData.actualStartTime = new Date();
    } else if (status === 'ended') {
      updateData.actualEndTime = new Date();
    }

    await db.collection('liveRooms').updateOne(
      { roomId },
      { $set: updateData }
    );

    return createSuccessResponse({ success: true, status });
  } catch (error) {
    return createErrorResponse(error, 'Failed to update status', 500);
  }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const roomId = searchParams.get('roomId');

        if (!roomId) {
            return createErrorResponse('Missing roomId', 'Missing roomId', 400);
        }

        const db = await getDatabase();
        const room = await db.collection('liveRooms').findOne({ roomId }, { projection: { status: 1 } });

        if (!room) {
            return createErrorResponse('Room not found', 'Room not found', 404);
        }

        return createSuccessResponse({ status: room.status });
    } catch (error) {
        return createErrorResponse(error, 'Failed to fetch status', 500);
    }
}
