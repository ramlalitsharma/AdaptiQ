import { ObjectId } from 'mongodb';

export interface Referral {
    _id?: ObjectId;
    referrerId: string; // clerkId of the person who shared the link
    referredId: string; // clerkId of the new user who joined
    status: 'pending' | 'completed';
    rewardClaimed: boolean;
    createdAt: Date;
    completedAt?: Date;
}

export const REFERRALS_COLLECTION = 'referrals';
