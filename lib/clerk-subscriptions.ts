import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * Check if user has active premium subscription using Clerk's subscription features
 */
export async function checkSubscriptionStatus(): Promise<{
  hasAccess: boolean;
  tier: 'free' | 'premium';
  status?: string;
}> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return { hasAccess: false, tier: 'free' };
    }

    // If secret is not set in local dev, default to free and skip network call
    if (!process.env.CLERK_SECRET_KEY || !(clerkClient as any)?.users?.getUser) {
      return { hasAccess: false, tier: 'free' };
    }

    const user = await clerkClient.users.getUser(userId);
    
    // Clerk stores subscription data in user metadata or organization membership
    // For Clerk subscriptions, check organization membership or metadata
    const subscriptionTier = user.publicMetadata?.subscriptionTier as string || 'free';
    const subscriptionStatus = user.publicMetadata?.subscriptionStatus as string;
    
    // Check if user has active premium subscription
    const hasAccess = subscriptionTier === 'premium' && 
                     (subscriptionStatus === 'active' || subscriptionStatus === 'trialing');
    
    return {
      hasAccess,
      tier: subscriptionTier as 'free' | 'premium',
      status: subscriptionStatus,
    };
  } catch (error) {
    console.error('Error checking subscription:', error);
    return { hasAccess: false, tier: 'free' };
  }
}

/**
 * Get subscription details for the current user
 */
export async function getSubscriptionDetails() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    if (!process.env.CLERK_SECRET_KEY || !(clerkClient as any)?.users?.getUser) {
      return { tier: 'free' as const, status: undefined, currentPeriodEnd: undefined };
    }

    const user = await clerkClient.users.getUser(userId);
    
    return {
      tier: user.publicMetadata?.subscriptionTier || 'free',
      status: user.publicMetadata?.subscriptionStatus,
      currentPeriodEnd: user.publicMetadata?.subscriptionCurrentPeriodEnd,
    };
  } catch (error) {
    console.error('Error getting subscription details:', error);
    return {
      tier: 'free' as const,
      status: undefined,
      currentPeriodEnd: undefined,
    };
  }
}

/**
 * Update user subscription status (to be called by webhook from Clerk)
 */
export async function updateSubscriptionStatus(
  userId: string,
  tier: 'free' | 'premium',
  status: string,
  currentPeriodEnd?: Date
) {
  try {
    if (!process.env.CLERK_SECRET_KEY || !(clerkClient as any)?.users?.updateUserMetadata) {
      console.warn('CLERK_SECRET_KEY not set - cannot update subscription');
      return;
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscriptionTier: tier,
        subscriptionStatus: status,
        subscriptionCurrentPeriodEnd: currentPeriodEnd?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
}
