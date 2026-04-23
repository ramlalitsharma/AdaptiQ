import { NextResponse } from 'next/server';
import { NewsAutomationService } from '@/lib/news-automation';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * Manual trigger endpoint for the news automation engine.
 * Call: GET /api/news-publish-now?count=5&country=Nepal
 * No auth required for local dev; set CRON_SECRET in prod to restrict.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');

    // Optional secret protection for production
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const count = Math.min(10, Math.max(1, Number(searchParams.get('count') || '5')));
    const country = searchParams.get('country') || undefined;

    console.log(`[ManualTrigger] Publishing ${count} articles${country ? ` (country: ${country})` : ''}...`);

    try {
        const published = await NewsAutomationService.ingestRoamingGlobalNews(count, country);

        return NextResponse.json({
            success: true,
            published: published.length,
            articles: published.map((a: any) => ({ title: a.title, status: a.status })),
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('[ManualTrigger] Failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
