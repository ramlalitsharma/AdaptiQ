import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const db = await getDatabase();
    const progressCol = db.collection('userProgress');
    const usersCol = db.collection('users');

    const totalQuizzes = await progressCol.countDocuments({ userId });
    const bestScore = await progressCol.find({ userId }).sort({ score: -1 }).limit(1).toArray();
    const highest = bestScore[0]?.score || 0;

    // Simple achievements logic
    const achievements: any[] = [];
    if (totalQuizzes >= 1) {
      achievements.push({ id: 'first-quiz', title: 'Getting Started', description: 'Complete your first quiz', icon: '🎯', unlocked: true, category: 'quiz' });
    }
    if (highest >= 100) {
      achievements.push({ id: 'perfect-score', title: 'Perfect Score', description: 'Get 100% on a quiz', icon: '⭐', unlocked: true, category: 'quiz' });
    }

    // streak from users collection if tracked
    const u = await usersCol.findOne({ clerkId: userId });
    const streak = u?.streak || 0;
    if (streak >= 7) {
      achievements.push({ id: 'week-streak', title: 'Week Warrior', description: 'Maintain a 7-day study streak', icon: '🔥', unlocked: true, category: 'streak' });
    }

    return NextResponse.json(achievements);
  } catch (error: any) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements', message: error.message }, { status: 500 });
  }
}


