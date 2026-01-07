import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { publish } from '@/lib/live/chat-bus';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get('roomId');
    if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });
    if (!room || !room.courseId) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const isOwner = room.createdBy === userId;
    const admin = await isAdmin();
    if (!isOwner && !admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const settings = await db.collection('liveClassChatSettings').findOne({ courseId: String(room.courseId) });
    const mutes = await db.collection('liveClassChatMutes').find({ courseId: String(room.courseId) }).toArray();
    return NextResponse.json({
      data: {
        locked: Boolean(settings?.locked),
        mutes: mutes.map((m: any) => ({ userId: m.userId, until: m.until })),
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch moderation data', message: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { roomId, action, targetUserId, messageId, until } = body || {};
    if (!roomId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });
    if (!room || !room.courseId) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const isOwner = room.createdBy === userId;
    const admin = await isAdmin();
    if (!isOwner && !admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const courseId = String(room.courseId);

    if (action === 'deleteMessage') {
      if (!messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 });
      await db.collection('liveClassChats').deleteOne({ _id: new ObjectId(messageId), courseId });
      publish(courseId, 'chat.delete', { messageId });
      return NextResponse.json({ success: true });
    }
    if (action === 'pinMessage') {
      if (!messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 });
      await db.collection('liveClassChats').updateOne({ _id: new ObjectId(messageId), courseId }, { $set: { isPinned: true } });
      publish(courseId, 'chat.pin', { messageId });
      return NextResponse.json({ success: true });
    }
    if (action === 'unpinMessage') {
      if (!messageId) return NextResponse.json({ error: 'messageId required' }, { status: 400 });
      await db.collection('liveClassChats').updateOne({ _id: new ObjectId(messageId), courseId }, { $set: { isPinned: false } });
      publish(courseId, 'chat.unpin', { messageId });
      return NextResponse.json({ success: true });
    }
    if (action === 'muteUser') {
      if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
      await db.collection('liveClassChatMutes').updateOne(
        { courseId, userId: targetUserId },
        { $set: { courseId, userId: targetUserId, until: until || null, updatedAt: new Date() } },
        { upsert: true }
      );
      publish(courseId, 'chat.mute', { userId: targetUserId });
      return NextResponse.json({ success: true });
    }
    if (action === 'unmuteUser') {
      if (!targetUserId) return NextResponse.json({ error: 'targetUserId required' }, { status: 400 });
      await db.collection('liveClassChatMutes').deleteOne({ courseId, userId: targetUserId });
      publish(courseId, 'chat.unmute', { userId: targetUserId });
      return NextResponse.json({ success: true });
    }
    if (action === 'lockChat') {
      await db.collection('liveClassChatSettings').updateOne(
        { courseId },
        { $set: { courseId, locked: true, updatedAt: new Date() } },
        { upsert: true }
      );
      publish(courseId, 'chat.lock', { locked: true });
      return NextResponse.json({ success: true });
    }
    if (action === 'unlockChat') {
      await db.collection('liveClassChatSettings').updateOne(
        { courseId },
        { $set: { courseId, locked: false, updatedAt: new Date() } },
        { upsert: true }
      );
      publish(courseId, 'chat.lock', { locked: false });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Moderation failed', message: e.message }, { status: 500 });
  }
}
