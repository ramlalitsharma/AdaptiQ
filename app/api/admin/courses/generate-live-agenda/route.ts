import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { lessonTitle, courseTitle, duration = '60 mins' } = await req.json();

        if (!lessonTitle) {
            return NextResponse.json({ error: 'Lesson Title is required' }, { status: 400 });
        }

        if (!openai) {
            return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
        }

        const systemPrompt = `You are an expert Live Event Facilitator. Create a detailed minute-by-minute run sheet (agenda) for a live class.
    
    Course: ${courseTitle}
    Session: ${lessonTitle}
    Duration: ${duration}
    
    Structure:
    - **0-5m**: Welcome & Icebreaker (Suggest one)
    - **5-15m**: Topic 1 (Key points)
    - **15-30m**: Interactive Activity / Demo
    - **30-45m**: Topic 2
    - **45-55m**: Q&A
    - **55-60m**: Wrap up & Next Steps
    
    Output Format: Markdown. Use checkboxes for the instructor to tick off as they go.`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Create an agenda for "${lessonTitle}"` }
            ],
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No content generated');

        return NextResponse.json({ content });

    } catch (error: any) {
        console.error('Agenda generation error:', error);
        return NextResponse.json({ error: 'Failed to generate agenda', message: error.message }, { status: 500 });
    }
}
