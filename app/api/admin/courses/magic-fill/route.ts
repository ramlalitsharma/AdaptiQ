import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { title } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        if (!openai) {
            return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
        }

        const systemPrompt = `You are an expert Educational Content Strategist. Your goal is to infer comprehensive course metadata from a simple course title.
    
    RETURN JSON ONLY.
    
    Fields to generate:
    - description: A compelling, HTML-formatted marketing description (2-3 paragraphs). Use <b>, <i>, <br>, <ul>, <li> tags.
    - summary: A punchy one-sentence summary.
    - level: 'basic', 'intermediate', or 'advanced'.
    - category: A single category string (e.g. 'Programming', 'Design', 'Business', 'Marketing').
    - tags: Array of 5-8 relevant tags.
    - learningGoals: Array of 3-5 specific learning outcomes.
    - targetAudience: String describing who this is for.
    - seo: Object with title (meta title, max 60 chars), description (meta description, max 160 chars), keywords (array), slug (URL friendly).
    `;

        const userPrompt = `Generate course details for: "${title}"`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No content generated');

        const data = JSON.parse(content);

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('Magic Fill error:', error);
        return NextResponse.json({ error: 'Failed to generate details', message: error.message }, { status: 500 });
    }
}
