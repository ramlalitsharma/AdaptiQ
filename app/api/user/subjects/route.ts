import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDatabase();
  const col = db.collection('userSubjects');
  const rows = await col.find({ userId }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const { subjectName, levelName } = body || {};
  if (!subjectName) return NextResponse.json({ error: 'subjectName required' }, { status: 400 });
  const db = await getDatabase();
  const col = db.collection('userSubjects');
  const doc = { userId, subjectName: String(subjectName).trim(), levelName: levelName ? String(levelName).trim() : undefined, createdAt: new Date() };
  const res = await col.insertOne(doc as any);
  return NextResponse.json({ id: res.insertedId });
}


