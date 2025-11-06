import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { Subject } from '@/lib/models/Subject';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const db = await getDatabase();
    const subjectsCollection = db.collection<Subject>('subjects');
    
    const subjects = await subjectsCollection
      .find({ isActive: true })
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json(subjects);
  } catch (error: any) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subjects', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const subject: Omit<Subject, '_id' | 'createdAt' | 'updatedAt'> = body;

    const db = await getDatabase();
    const subjectsCollection = db.collection<Subject>('subjects');
    
    const result = await subjectsCollection.insertOne({
      ...subject,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Subject);

    return NextResponse.json({ id: result.insertedId });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: 'Failed to create subject', message: error.message },
      { status: 500 }
    );
  }
}
