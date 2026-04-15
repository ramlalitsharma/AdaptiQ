import { getDatabase } from './lib/mongodb';
import { SEASONAL_CHALLENGES_COLLECTION } from './lib/models/SeasonalChallenge';

async function seedSeasonal() {
    const db = await getDatabase();
    const col = db.collection(SEASONAL_CHALLENGES_COLLECTION);

    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    const challenges = [
        {
            id: 'winter_coding_2026',
            title: 'Winter Coding Bash ❄️',
            description: 'Complete 10 quizzes this winter to earn the Ice Coder badge!',
            startDate: now,
            endDate: nextMonth,
            requirementType: 'quizzes_completed',
            requirementValue: 10,
            rewardBadgeId: 'ice_coder',
            rewardXP: 500,
            active: true,
            themeColor: 'blue',
            createdAt: now,
            updatedAt: now
        },
        {
            id: 'february_fire',
            title: 'Consistency King 🔥',
            description: 'Maintain a 5-day streak in February.',
            startDate: now,
            endDate: nextMonth,
            requirementType: 'streak_days',
            requirementValue: 5,
            rewardBadgeId: 'fire_soul',
            rewardXP: 300,
            active: true,
            themeColor: 'orange',
            createdAt: now,
            updatedAt: now
        }
    ];

    for (const challenge of challenges) {
        await col.updateOne(
            { id: challenge.id },
            { $set: challenge },
            { upsert: true }
        );
    }

    console.log('Seasonal challenges seeded!');
    process.exit(0);
}

seedSeasonal().catch(console.error);
