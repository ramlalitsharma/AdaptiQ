import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { serializeExamTemplate } from '@/lib/models/ExamTemplate';

export const runtime = 'nodejs';

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const exams = await db.collection('examTemplates').find({}).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json({ exams: exams.map(serializeExamTemplate) });
  } catch (error: any) {
    console.error('Exam templates fetch error:', error);
    return NextResponse.json({ error: 'Failed to load exams', message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, questionBankIds, questionIds, durationMinutes, totalMarks, tags } = await req.json();

    if (!name || !Array.isArray(questionIds) || questionIds.length === 0) {
      return NextResponse.json({ error: 'Exam name and at least one question are required' }, { status: 400 });
    }

    const record = {
      name,
      description: description || '',
      questionBankIds: Array.isArray(questionBankIds) ? questionBankIds : [],
      questionIds,
      durationMinutes: Number(durationMinutes) || 60,
      totalMarks: Number(totalMarks) || questionIds.length,
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection('examTemplates').insertOne(record);
    return NextResponse.json({ success: true, exam: serializeExamTemplate({ ...record, _id: result.insertedId }) });
  } catch (error: any) {
    console.error('Exam template create error:', error);
    return NextResponse.json({ error: 'Failed to create exam', message: error.message }, { status: 500 });
  }
}
