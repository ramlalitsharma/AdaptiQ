import { getDatabase } from './mongodb';
import { User } from './models/User';
import { Referral, REFERRALS_COLLECTION } from './models/Referral';
import { logger } from './logger';
import { EmailService } from './email-service';
import { createActivity } from './social-service';

/**
 * Generate a unique referral code for a user
 */
export function generateReferralCode(name: string): string {
    const prefix = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${random}`;
}

/**
 * Link a new user to a referrer using their code
 */
export async function trackReferral(referrerCode: string, referredUserId: string) {
    const db = await getDatabase();
    const users = db.collection<User>('users');
    const referrals = db.collection<Referral>(REFERRALS_COLLECTION);

    try {
        // 1. Find the referrer
        const referrer = await users.findOne({ referralCode: referrerCode });
        if (!referrer) {
            logger.warn(`Referral track failed: Code ${referrerCode} not found`);
            return;
        }

        // 2. Prevent self-referral
        if (referrer.clerkId === referredUserId) return;

        // 3. Check if already referred
        const existing = await referrals.findOne({ referredId: referredUserId });
        if (existing) return;

        // 4. Create referral record
        const referral: Referral = {
            referrerId: referrer.clerkId,
            referredId: referredUserId,
            status: 'completed', // For now, status is completed upon registration
            rewardClaimed: false,
            createdAt: new Date(),
            completedAt: new Date(),
        };

        await referrals.insertOne(referral);

        // 5. Update users
        await users.updateOne(
            { clerkId: referredUserId },
            { $set: { referredBy: referrer.clerkId } }
        );

        await users.updateOne(
            { clerkId: referrer.clerkId },
            { $inc: { referralCount: 1 } }
        );

        // 6. Notify referrer (Email + Activity Feed)
        if (referrer.email) {
            // We'll implement this template next
            // EmailService.sendReferralSuccess(referrer.email, referrer.name, 'friend'); 
        }

        await createActivity({
            userId: referrer.clerkId,
            activityType: 'achievement',
            title: 'New Referral! 🤝',
            description: `A friend joined AdaptiQ using your link.`,
            icon: '🤝',
            visibility: 'friends'
        });

    } catch (error) {
        logger.error('Error tracking referral', error);
    }
}

/**
 * Claim rewards for successful referrals
 */
export async function claimReferralRewards(userId: string) {
    const db = await getDatabase();
    const referrals = db.collection<Referral>(REFERRALS_COLLECTION);
    const users = db.collection<User>('users');

    const unclaimed = await referrals.find({ referrerId: userId, rewardClaimed: false }).toArray();

    if (unclaimed.length === 0) return 0;

    // Logic: Grant 100 XP per referral
    const totalXP = unclaimed.length * 100;

    try {
        await users.updateOne(
            { clerkId: userId },
            { $inc: { 'learningProgress.masteryLevel': 1 } } // Placeholder reward
        );

        await referrals.updateMany(
            { referrerId: userId, rewardClaimed: false },
            { $set: { rewardClaimed: true } }
        );

        return totalXP;
    } catch (error) {
        logger.error('Error claiming referral rewards', error);
        return 0;
    }
}
