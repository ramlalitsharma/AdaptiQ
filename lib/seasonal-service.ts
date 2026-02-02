import { getDatabase } from './mongodb';
import { SeasonalChallenge, SEASONAL_CHALLENGES_COLLECTION } from './models/SeasonalChallenge';
import { UserSeasonalProgress, USER_SEASONAL_PROGRESS_COLLECTION } from './models/UserSeasonalProgress';
import { awardXP } from './xp-system';

export const SeasonalService = {
    /**
     * Get all active seasonal challenges
     */
    async getActiveChallenges(): Promise<SeasonalChallenge[]> {
        const db = await getDatabase();
        const now = new Date();
        return await db.collection<SeasonalChallenge>(SEASONAL_CHALLENGES_COLLECTION)
            .find({
                active: true,
                startDate: { $lte: now },
                endDate: { $gte: now }
            })
            .toArray();
    },

    /**
     * Track progress for a specific user action
     */
    async trackProgress(userId: string, type: string, value: number = 1) {
        const db = await getDatabase();
        const activeChallenges = await this.getActiveChallenges();

        for (const challenge of activeChallenges) {
            if (challenge.requirementType === type) {
                const query = { userId, challengeId: challenge.id };
                const update = {
                    $inc: { currentValue: value },
                    $set: { updatedAt: new Date() },
                    $setOnInsert: { completed: false, rewarded: false }
                };

                const result = await db.collection<UserSeasonalProgress>(USER_SEASONAL_PROGRESS_COLLECTION)
                    .findOneAndUpdate(query, update, { upsert: true, returnDocument: 'after' });

                if (result && result.currentValue >= challenge.requirementValue && !result.completed) {
                    // Mark as completed
                    await db.collection<UserSeasonalProgress>(USER_SEASONAL_PROGRESS_COLLECTION)
                        .updateOne(query, { $set: { completed: true, completedAt: new Date() } });

                    // Award rewards if not already done
                    if (!result.rewarded) {
                        await awardXP(userId, challenge.rewardXP, `seasonal_completion_${challenge.id}`);
                        await db.collection<UserSeasonalProgress>(USER_SEASONAL_PROGRESS_COLLECTION)
                            .updateOne(query, { $set: { rewarded: true } });
                    }
                }
            }
        }
    },

    /**
     * Get user's seasonal progress
     */
    async getUserProgress(userId: string) {
        const db = await getDatabase();
        const activeChallenges = await this.getActiveChallenges();
        const userProgress = await db.collection<UserSeasonalProgress>(USER_SEASONAL_PROGRESS_COLLECTION)
            .find({ userId })
            .toArray();

        return activeChallenges.map(challenge => {
            const progress = userProgress.find(p => p.challengeId === challenge.id);
            return {
                challenge,
                currentValue: progress?.currentValue || 0,
                completed: progress?.completed || false,
                progressPercent: Math.min(100, ((progress?.currentValue || 0) / challenge.requirementValue) * 100)
            };
        });
    }
};
