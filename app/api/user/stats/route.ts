import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { getCached, setCached } from '@/lib/redis-cache';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try cache first (5 min TTL)
    const cacheKey = `stats:${userId}`;
    const cached = await getCached<any>(cacheKey, 300);
    if (cached) return NextResponse.json(cached);

    const db = await getDatabase();
    const progressCol = db.collection('userProgress');

    const recentProgress = await progressCol
      .find({ userId })
      .sort({ completedAt: -1 })
      .limit(100)
      .toArray();

    const totalQuizzes = recentProgress.length;
    const averageScore = totalQuizzes
      ? recentProgress.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / totalQuizzes
      : 0;

    const knowledgeGapsSet = new Set<string>();
    recentProgress.forEach((p: any) => (p.knowledgeGapsIdentified || []).forEach((g: string) => knowledgeGapsSet.add(g)));
    const knowledgeGaps = Array.from(knowledgeGapsSet).slice(0, 20);

    // Mastery per subject (basic heuristic: average score by quizId prefix or subject field if present)
    const subjectScores: Record<string, { sum: number; count: number }> = {};
    recentProgress.forEach((p: any) => {
      const subject = p.subject || (p.quizId?.split(':')[0]) || 'General';
      if (!subjectScores[subject]) subjectScores[subject] = { sum: 0, count: 0 };
      subjectScores[subject].sum += p.score || 0;
      subjectScores[subject].count += 1;
    });

    const mastery = Object.entries(subjectScores).map(([subject, v]) => ({
      subject,
      percent: v.count ? Math.round(v.sum / v.count) : 0,
    }));

    const result = {
      totalQuizzes,
      averageScore,
      knowledgeGaps,
      mastery,
    };

    // Cache result
    await setCached(cacheKey, result, 300);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats', message: error.message }, { status: 500 });
  }
}


