import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getCache, setCache } from '@/lib/cache/redis';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const cacheKey = `recommendations:${userId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json({ recommendations: cached });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const result = await getPersonalizedRecommendations(userId, limit);

    // Cache for 1 hour to optimize performance
    await setCache(cacheKey, result, 3600);

    return NextResponse.json({ recommendations: result });
  } catch (e: any) {
    console.error('Recommendations error:', e);
    return NextResponse.json({ error: 'Failed to get recommendations', message: e.message }, { status: 500 });
  }
}

