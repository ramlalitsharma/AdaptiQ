import { NextResponse } from 'next/server';
import { BlogAutomationService } from '@/lib/blog-automation';

/**
 * PHASE 71: BLOG AUTOMATION TRIGGER
 * Endpoint to trigger the autonomous Blog Architect.
 * Secured by CRON_SECRET to prevent unauthorized execution.
 */
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('x-cron-secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized: Access Denied' }, { status: 401 });
  }

  try {
    const seedTopic = searchParams.get('topic') || undefined;
    console.log(`[API] Triggering Blog Architect for topic: ${seedTopic || 'Latest Trend'}`);
    
    // We execute this but since it can take minutes, for a real cron we might want to 
    // run it in a way that doesn't timeout the request if possible.
    // However, for Vercel Hobby/Pro, we will try to complete it or use a background pattern.
    const result = await BlogAutomationService.generateAutonomousBlog(seedTopic);

    return NextResponse.json({
      success: true,
      message: 'Blog Architect cycle completed successfully.',
      data: result
    });
  } catch (error: any) {
    console.error('[API] Blog Architect failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal Server Error' 
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
    return POST(request);
}
