import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

// Returns real syllabus topics for a subject & level. If none found, returns 404 (no fake data)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');
    const levelId = searchParams.get('levelId');

    if (!subjectId) {
      return NextResponse.json({ error: 'subjectId is required' }, { status: 400 });
    }

    const db = await getDatabase();
    const topicsCollection = db.collection('topics');

    const query: any = { subjectId };
    if (levelId) query.levelId = levelId;

    const topics = await topicsCollection.find(query).sort({ order: 1 }).toArray();

    if (!topics || topics.length === 0) {
      return NextResponse.json({ error: 'No syllabus available for this selection.' }, { status: 404 });
    }

    return NextResponse.json(topics);
  } catch (error: any) {
    console.error('Error fetching syllabus:', error);
    return NextResponse.json(
      { error: 'Failed to fetch syllabus', message: error.message },
      { status: 500 }
    );
  }
}


