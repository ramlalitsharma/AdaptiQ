import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { publish } from '@/lib/live/chat-bus';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.json({ error: 'roomId required' }, { status: 400 });
    }
    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });
    if (!room || !room.courseId) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const enrollment = await db.collection('enrollments').findOne({
      userId,
      courseId: String(room.courseId),
      status: 'approved',
    });
    const isOwner = room.createdBy === userId;
    if (!enrollment && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const messages = await db
      .collection('liveClassChats')
      .find({ courseId: String(room.courseId) })
      .sort({ isPinned: -1, createdAt: 1 })
      .limit(500)
      .toArray();
    const serialized = messages.map((m: any) => ({
      _id: String(m._id),
      courseId: m.courseId,
      roomId: m.roomId,
      userId: m.userId,
      userName: m.userName,
      content: m.content,
      type: m.type,
      url: m.url,
      imageUrl: m.imageUrl,
      createdAt: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
    }));
    return NextResponse.json({ data: { messages: serialized } });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to load chat', message: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { roomId, content, type, url, imageUrl } = body || {};
    if (!roomId || !content) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });
    if (!room || !room.courseId) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const enrollment = await db.collection('enrollments').findOne({
      userId,
      courseId: String(room.courseId),
      status: 'approved',
    });
    const isOwner = room.createdBy === userId;
    if (!enrollment && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const settings = await db.collection('liveClassChatSettings').findOne({ courseId: String(room.courseId) });
    if (settings?.locked && room.createdBy !== userId) {
      return NextResponse.json({ error: 'Chat locked' }, { status: 403 });
    }
    const mute = await db.collection('liveClassChatMutes').findOne({ courseId: String(room.courseId), userId });
    if (mute && (!mute.until || new Date(mute.until) > new Date())) {
      return NextResponse.json({ error: 'Muted' }, { status: 403 });
    }

    const userDoc = await db.collection('users').findOne({ clerkId: userId });
    const message = {
      courseId: String(room.courseId),
      roomId,
      userId,
      userName: userDoc?.name || userDoc?.email || 'Student',
      content: String(content),
      type: type || 'text',
      url: url || null,
      imageUrl: imageUrl || null,
      isPinned: false,
      createdAt: new Date(),
    };
    const result = await db.collection('liveClassChats').insertOne(message);
    publish(String(room.courseId), 'chat.message', { ...message, _id: String(result.insertedId) });
    return NextResponse.json({
      success: true,
      messageId: String(result.insertedId),
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to send message', message: e.message }, { status: 500 });
  }
}
