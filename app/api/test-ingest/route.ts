import { NextResponse } from 'next/server';
import { NewsAutomationService } from '@/lib/news-automation';

export async function GET() {
    try {
        const result = await NewsAutomationService.ingestRoamingGlobalNews(5, 'Nepal');
        return NextResponse.json({ success: true, count: result.length, items: result.map(i => i.title) });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message, stack: error.stack }, { status: 500 });
    }
}
