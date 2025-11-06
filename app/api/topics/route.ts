import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { subjectId, levelId, name, order, estimatedTime } = body || {};

    if (!subjectId || !levelId || !name) {
      return NextResponse.json({ error: 'subjectId, levelId and name are required' }, { status: 400 });
    }

    const db = await getDatabase();
    const topicsCol = db.collection('topics');

    const doc = {
      subjectId,
      levelId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: '',
      order: Number(order) || 1,
      estimatedTime: Number(estimatedTime) || 20,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await topicsCol.insertOne(doc);
    return NextResponse.json({ id: result.insertedId });
  } catch (error: any) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Failed to create topic', message: error.message }, { status: 500 });
  }
}


