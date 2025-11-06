import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateAdaptiveQuestion } from '@/lib/openai';
import { checkSubscriptionStatus } from '@/lib/clerk-subscriptions';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          message: 'Please add OPENAI_API_KEY to your .env.local file'
        },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { topic, difficulty, previousPerformance, context } = body;

    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    // Check subscription for premium features (optional - defaults to free tier if check fails)
    let subscription;
    try {
      subscription = await checkSubscriptionStatus();
    } catch (error) {
      console.warn('Could not check subscription status, defaulting to free tier:', error);
      subscription = { hasAccess: false, tier: 'free' as const };
    }
    
    // Premium users can use advanced AI models
    const model = subscription.hasAccess ? 'gpt-4o' : 'gpt-4o-mini';

    const question = await generateAdaptiveQuestion(
      topic,
      difficulty || 'medium',
      previousPerformance,
      context
    );

    return NextResponse.json(question);
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    
    // Provide more detailed error information
    let errorMessage = error.message || 'Failed to generate quiz';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'OpenAI API key is invalid or missing. Please check your .env.local file.';
    } else if (error.status === 429) {
      // Handle rate limit or quota errors
      if (error.code === 'insufficient_quota') {
        errorMessage = 'OpenAI account has insufficient quota. Please add credits to your account at https://platform.openai.com/account/billing';
      } else if (error.code === 'rate_limit_exceeded') {
        const retryAfter = error.headers?.['retry-after'] || error.headers?.['retry-after-ms'] || '20';
        errorMessage = `Rate limit exceeded. Please wait ${retryAfter} seconds and try again. Add a payment method to increase limits at https://platform.openai.com/account/billing`;
      } else {
        errorMessage = 'Rate limit exceeded. Please try again in a moment. Add a payment method to increase limits at https://platform.openai.com/account/billing';
      }
    } else if (error.message?.includes('insufficient_quota') || error.code === 'insufficient_quota') {
      errorMessage = 'OpenAI account has insufficient quota. Please add credits to your account at https://platform.openai.com/account/billing';
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate quiz',
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
