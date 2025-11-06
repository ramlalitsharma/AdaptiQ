import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { generateAdaptiveQuestion } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, category } = body; // type: 'quick' | 'full', category: IQCategory

    // Generate IQ assessment questions using AI
    const questions = [];
    const questionCount = type === 'quick' ? 10 : 30;

    for (let i = 0; i < questionCount; i++) {
      const question = await generateAdaptiveQuestion(
        `IQ test ${category || 'logical reasoning'}`,
        'medium',
        undefined
      );
      questions.push({
        ...question,
        category: category || 'logical-reasoning',
        timeLimit: 60,
        points: 10,
      });
    }

    // Save assessment to database
    const db = await getDatabase();
    const assessmentsCollection = db.collection('iqAssessments');
    
    const assessment = {
      userId,
      type: type || 'quick',
      categories: [category || 'logical-reasoning'],
      questions,
      answers: [],
      startedAt: new Date(),
      createdAt: new Date(),
    };

    const result = await assessmentsCollection.insertOne(assessment);

    return NextResponse.json({
      assessmentId: result.insertedId,
      questions,
    });
  } catch (error: any) {
    console.error('Error creating IQ assessment:', error);
    return NextResponse.json(
      { error: 'Failed to create assessment', message: error.message },
      { status: 500 }
    );
  }
}
