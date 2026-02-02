import { getDatabase } from "./mongodb";

/**
 * AI-Inspired recommendation engine
 * Analyzes user history, knowledge gaps, and current mastery to suggest next logical steps
 */
export async function getPersonalizedRecommendations(userId: string, limit = 6) {
    const db = await getDatabase();

    // 1. Get user statistics and progress
    const [stats, progress] = await Promise.all([
        db.collection("userStats").findOne({ userId }),
        db.collection("userProgress").find({ userId }).toArray(),
    ]);

    const existingCourseIds = progress.map((p) => p.courseId);
    const masterySubjects = (stats?.mastery || []).map((m: any) => m.subject);
    const gaps = (stats?.knowledgeGaps || []).map((g: any) => g.topic);

    // 2. Build scoring logic for potential courses
    const allCourses = await db.collection("courses")
        .find({ status: "published", _id: { $nin: existingCourseIds } })
        .toArray();

    const scoredCourses = allCourses.map((course) => {
        let score = 0;

        // Preference for subjects user is already interested in
        if (masterySubjects.includes(course.subject)) {
            score += 50;
        }

        // High priority for courses addressing knowledge gaps
        if (gaps.some((gap: string) => course.tags?.includes(gap) || course.title.toLowerCase().includes(gap.toLowerCase()))) {
            score += 100;
        }

        // Boost "Popular" or "New" courses slightly
        if (course.isPopular) score += 20;
        if (new Date().getTime() - new Date(course.createdAt).getTime() < 7 * 24 * 3600 * 1000) {
            score += 30;
        }

        // Difficulty progression (if user is high level, suggest harder courses)
        const userLevel = stats?.currentLevel || 1;
        if (userLevel > 5 && course.level === "Advanced") score += 40;
        if (userLevel < 3 && course.level === "Beginner") score += 40;

        return { ...course, recommendationScore: score };
    });

    // 3. Return top N recommendations
    return scoredCourses
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, limit);
}
