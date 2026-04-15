import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { LearningPathService } from '@/lib/learning-path-service';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { goal } = await req.json();
        if (!goal || goal.length < 3) {
            return NextResponse.json({ error: 'Please provide a clearer goal' }, { status: 400 });
        }

        const path = await LearningPathService.generateAIPath(goal, userId);

        return NextResponse.json({ path });
    } catch (error: any) {
        console.error('AI Path API Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI learning path', message: error.message },
            { status: 500 }
        );
    }
}
