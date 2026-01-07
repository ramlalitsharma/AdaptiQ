import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const roomId = formData.get('roomId') as string | null;
    if (!file || !roomId) return NextResponse.json({ error: 'Missing file or roomId' }, { status: 400 });

    const db = await getDatabase();
    const room = await db.collection('liveRooms').findOne({ roomId });
    if (!room || !room.courseId) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    const enrollment = await db.collection('enrollments').findOne({
      userId,
      courseId: String(room.courseId),
      status: 'approved',
    });
    const isOwner = room.createdBy === userId;
    if (!enrollment && !isOwner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'chat');
    fs.mkdirSync(uploadsDir, { recursive: true });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
    const safeName = `chat_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const fullPath = path.join(uploadsDir, safeName);
    fs.writeFileSync(fullPath, buffer);

    const url = `/uploads/chat/${safeName}`;
    return NextResponse.json({ success: true, url });
  } catch (e: any) {
    return NextResponse.json({ error: 'Upload failed', message: e.message }, { status: 500 });
  }
}

