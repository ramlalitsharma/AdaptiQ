import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { subscribe } from '@/lib/live/chat-bus';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get('roomId');
  if (!roomId) {
    return new Response('roomId required', { status: 400 });
  }
  const db = await getDatabase();
  const room = await db.collection('liveRooms').findOne({ roomId });
  if (!room || !room.courseId) {
    return new Response('Room not found', { status: 404 });
  }
  const enrollment = await db.collection('enrollments').findOne({
    userId,
    courseId: String(room.courseId),
    status: 'approved',
  });
  const isOwner = room.createdBy === userId;
  if (!enrollment && !isOwner) {
    return new Response('Forbidden', { status: 403 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const unsubscribe = subscribe(String(room.courseId), (evt) => {
        const data = JSON.stringify(evt);
        controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
      });
      // Heartbeat to keep connection alive
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
      }, 15000);
      (controller as any)._cleanup = () => {
        clearInterval(interval);
        unsubscribe();
      };
    },
    cancel(reason) {
      const cleanup = (this as any)._cleanup;
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}

