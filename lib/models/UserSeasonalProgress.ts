import { ObjectId } from 'mongodb';

export interface UserSeasonalProgress {
    _id?: ObjectId;
    userId: string;
    challengeId: string;
    currentValue: number;
    completed: boolean;
    completedAt?: Date;
    rewarded: boolean;
    updatedAt: Date;
}

export const USER_SEASONAL_PROGRESS_COLLECTION = 'userSeasonalProgress';
