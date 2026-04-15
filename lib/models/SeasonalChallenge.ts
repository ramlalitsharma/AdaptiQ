import { ObjectId } from 'mongodb';

export type ChallengeRequirementType = 'quizzes_completed' | 'xp_earned' | 'lessons_watched' | 'streak_days';

export interface SeasonalChallenge {
    _id?: ObjectId;
    id: string;              // Unique slug e.g. "winter_coding_2026"
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    requirementType: ChallengeRequirementType;
    requirementValue: number;
    rewardBadgeId: string;
    rewardXP: number;
    active: boolean;
    bannerImage?: string;
    themeColor?: string; // e.g. "blue" for winter, "orange" for autumn
    createdAt: Date;
    updatedAt: Date;
}

export const SEASONAL_CHALLENGES_COLLECTION = 'seasonalChallenges';
