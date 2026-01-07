import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { lessonTitle, courseTitle, count = 5 } = await req.json();

        if (!lessonTitle) {
            return NextResponse.json({ error: 'Lesson Title is required' }, { status: 400 });
        }

        if (!openai) {
            return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
        }

        const systemPrompt = `You are an expert Exam Creator. Create a multiple-choice quiz for a lesson.
    
    Course: ${courseTitle}
    Lesson: ${lessonTitle}
    
    RETURN JSON ONLY matching this structure:
    {
        "questions": [
            {
                "id": "q1",
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": 0, // Index of correct option (0-3)
                "explanation": "Why this is correct."
            }
        ]
    }

    Rules:
    1. Create ${count} questions.
    2. Make them challenging but fair.
    3. Ensure only one correct answer.
    `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Generate a ${count}-question quiz for "${lessonTitle}"` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No content generated');

        const data = JSON.parse(content);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Quiz generation error:', error);
        return NextResponse.json({ error: 'Failed to generate quiz', message: error.message }, { status: 500 });
    }
}
