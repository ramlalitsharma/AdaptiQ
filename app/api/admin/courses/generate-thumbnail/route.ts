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
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        if (!openai) {
            return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 });
        }

        // specific prompt for DALL-E 3 to ensure high quality consistent style
        const imagePrompt = `A professional, high-quality course thumbnail for a course titled "${title}". 
    Context: ${description?.substring(0, 100) || title}.
    Style: Modern, sleek, digital art, suitable for an educational platform using dark mode neon aesthetics or clean apple-style minimalism. 
    Aspect Ratio: 16:9. No text overlay if possible, or very minimal text.`;

        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: imagePrompt,
            n: 1,
            size: "1024x1024",
            quality: "standard",
            response_format: "url",
        });

        const imageUrl = response.data[0]?.url;

        if (!imageUrl) throw new Error('No image generated');

        return NextResponse.json({ url: imageUrl });

    } catch (error: any) {
        console.error('Thumbnail generation error:', error);
        return NextResponse.json({ error: 'Failed to generate thumbnail', message: error.message }, { status: 500 });
    }
}
