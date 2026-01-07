import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createJitsiRoom } from '@/lib/live/jitsi';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      courseId,
      unitId,
      chapterId,
      maxParticipants,
      contentType = 'live',
      playbackUrl,
      videoRef,
      enableRecording,
      enableScreenshare,
      enableChat,
      enableWhiteboard
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let roomData: any = {
      roomName: name,
      courseId: courseId || null,
      unitId: unitId || null,
      chapterId: chapterId || null,
      createdBy: userId,
      createdAt: new Date(),
      status: contentType === 'video' ? 'ready' : 'scheduled',
      contentType,
      playbackUrl: playbackUrl || null,
      videoRef: videoRef || null,
    };

    if (contentType === 'live') {
      const room = createJitsiRoom({
        roomName: name,
        isModerator: true,
      });
      roomData = {
        ...roomData,
        roomId: room.roomName,
        roomUrl: room.roomUrl,
        provider: 'jitsi',
        config: room.config,
      };
    } else {
      roomData.roomId = `vid_${Date.now()}`;
      roomData.roomUrl = playbackUrl || '';
      roomData.provider = 'custom';
    }

    const db = await getDatabase();
    await db.collection('liveRooms').insertOne(roomData);

    // If course hierarchy specified, automatically add as a lesson
    if (courseId && unitId && chapterId) {
      const lesson = {
        id: roomData.roomId,
        title: name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        contentType: 'live',
        liveRoomId: roomData.roomId,
        order: Date.now(),
      };

      await db.collection('courses').updateOne(
        { _id: (db as any).s.activeClient.db().s.namespace.db === 'test' ? courseId : new (require('mongodb').ObjectId)(courseId), "units.id": unitId, "units.chapters.id": chapterId },
        {
          $push: { "units.$[u].chapters.$[c].lessons": lesson }
        } as any,
        {
          arrayFilters: [{ "u.id": unitId }, { "c.id": chapterId }]
        }
      );
    }

    return NextResponse.json({ room: roomData });
  } catch (error: any) {
    console.error('Live room creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create live room', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const roomName = searchParams.get('roomName');

    if (roomName) {
      // Create Jitsi room on-the-fly (free, no API needed)
      const room = createJitsiRoom({ roomName });
      return NextResponse.json({ room });
    }

    // Get user's rooms
    const db = await getDatabase();
    const rooms = await db
      .collection('liveRooms')
      .find({ createdBy: userId, provider: 'jitsi' })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ rooms });
  } catch (error: any) {
    console.error('Live room fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch live rooms', message: error.message },
      { status: 500 }
    );
  }
}

