import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { lessonTitle, courseTitle, context } = await req.json();

        if (!lessonTitle || !courseTitle) {
            return NextResponse.json({ error: 'Lesson Title and Course Title are required' }, { status: 400 });
        }

        if (!openai) {
            return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
        }

        const systemPrompt = `You are a Technical Content Writer and Educator. Write a comprehensive, engaging lesson tutorial in Markdown.
    
    Course: ${courseTitle}
    Lesson: ${lessonTitle}
    ${context ? `Context: ${context}` : ''}
    
    Structure the content with:
    1. **Introduction**: What will we learn?
    2. **Core Concepts**: Detailed explanation.
    3. **Example/Code**: Use code blocks for technical topics.
    4. **Practical Step-by-Step**: How to do it.
    5. **Summary**: Key takeaways.
    
    Tone: Professional, encouraging, clear.
    Format: Markdown. Avoid H1 (#). Start with H2 (##).`;

        const userPrompt = `Write the content for the lesson "${lessonTitle}".`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.5,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No content generated');

        return NextResponse.json({ content });

    } catch (error: any) {
        console.error('Lesson generation error:', error);
        return NextResponse.json({ error: 'Failed to generate lesson', message: error.message }, { status: 500 });
    }
}
