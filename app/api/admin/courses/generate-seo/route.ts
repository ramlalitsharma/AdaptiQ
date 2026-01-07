
import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { title, description } = await req.json();

        if (!title) {
            return NextResponse.json({ error: 'Course title is required' }, { status: 400 });
        }

        if (!openai) {
            return NextResponse.json({ error: 'OpenAI not configured' }, { status: 503 });
        }

        const prompt = `
      Act as an expert SEO Specialist for Online Education.
      Refine the following course metadata regarding "${title}".
      
      Context: ${description || 'No description provided.'}

      Task: Generate highly optimized SEO metadata.
      
      Requirements:
      1. Title: Engaging, click-worthy, includes keywords. Max 60 chars.
      2. Description: Compelling summary, includes benefits. Max 160 chars.
      3. Keywords: 8-10 high-traffic, relevant tags/keywords, comma-separated.
      4. Slug: Clean, URL-friendly version of the title.

      Output JSON format:
      {
        "title": "...",
        "description": "...",
        "keywords": ["tag1", "tag2"...],
        "slug": "..."
      }
    `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are an SEO expert returning strict JSON.' },
                { role: 'user', content: prompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new Error('No content from AI');

        const result = JSON.parse(content);

        // Ensure array for keywords if AI returns string
        let keywords = result.keywords;
        if (typeof keywords === 'string') {
            keywords = keywords.split(',').map((k: string) => k.trim());
        }

        return NextResponse.json({
            title: result.title,
            description: result.description,
            keywords: keywords,
            slug: result.slug
        });

    } catch (error: any) {
        console.error('AI SEO Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate SEO', details: error.message }, { status: 500 });
    }
}
