import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin, getUserRole } from '@/lib/admin-check';
import { serializeQuestionBank } from '@/lib/models/QuestionBank';
import type { QuestionBank } from '@/lib/models/QuestionBank';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const role = await getUserRole();
    const isAllowed = role && ['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const db = await getDatabase();
    const banks = await db
      .collection<QuestionBank>('questionBanks')
      .find({})
      .sort({ updatedAt: -1 })
      .toArray();
    return NextResponse.json({ banks: banks.map(serializeQuestionBank) });
  } catch (error: any) {
    console.error('Question banks fetch error:', error);
    return NextResponse.json({ error: 'Failed to load question banks', message: error.message }, { status: 500 });
  }
}



export async function POST(req: NextRequest) {
  try {
    const role = await getUserRole();
    const isAllowed = role && ['superadmin', 'admin', 'teacher', 'student', 'user'].includes(role);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, description, subject, examType, tags, type } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const bank = {
      name,
      description: description || '',
      subject: subject || '',
      examType: examType || '',
      type: type || 'bank', // Default to 'bank' if not provided
      tags: Array.isArray(tags) ? tags : [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const db = await getDatabase();
    const result = await db.collection<QuestionBank>('questionBanks').insertOne(bank as QuestionBank);
    return NextResponse.json({ success: true, bank: serializeQuestionBank({ ...bank, _id: result.insertedId }) });
  } catch (error: any) {
    console.error('Question bank create error:', error);
    return NextResponse.json({ error: 'Failed to create question bank', message: error.message }, { status: 500 });
  }
}
