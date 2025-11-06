import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { analyzePerformanceAndPredictGaps } from '@/lib/openai';
import { checkSubscriptionStatus } from '@/lib/clerk-subscriptions';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { quizHistory } = body;

    if (!quizHistory || !Array.isArray(quizHistory)) {
      return NextResponse.json(
        { error: 'Quiz history is required and must be an array' },
        { status: 400 }
      );
    }

    // Check subscription - analysis is a premium feature
    const subscription = await checkSubscriptionStatus();
    
    if (!subscription.hasAccess) {
      return NextResponse.json(
        { 
          error: 'Premium subscription required',
          upgradeUrl: '/pricing'
        },
        { status: 403 }
      );
    }

    const analysis = await analyzePerformanceAndPredictGaps(quizHistory);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error('Error analyzing performance:', error);
    return NextResponse.json(
      { error: 'Failed to analyze performance', message: error.message },
      { status: 500 }
    );
  }
}
