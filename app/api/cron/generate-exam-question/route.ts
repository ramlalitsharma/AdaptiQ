import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { generateAdaptiveQuestion } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret');
    if (!secret || secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allExams = [
      'sat','act','gre','gmat','ielts','toefl','mcat','lsat',
      'jee-main','jee-advanced','neet','gate','upsc-cse','ssc-cgl','ibps-po','cat','cuet','clat',
      'see','neb-grade-12','ioe','ku-entrance','mecce'
    ];
    const examType = allExams[Math.floor(Math.random() * allExams.length)];
    const level: 'easy'|'medium'|'hard' = 'medium';

    const q = await generateAdaptiveQuestion(examType, level, undefined, { subjectName: examType.toUpperCase(), levelName: 'Daily' });

    const db = await getDatabase();
    await db.collection('examQuestions').insertOne({ examType, question: q, createdAt: new Date() });
    return NextResponse.json({ ok: true, examType });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed', message: e.message }, { status: 500 });
  }
}


