import { clerkClient } from '@clerk/nextjs/server';

type SubsProvider = 'clerk' | 'lemonsqueezy';

export interface SubscriptionInfo {
  tier: 'free' | 'premium';
  status?: string;
  currentPeriodEnd?: string;
}

function getProvider(): SubsProvider {
  const p = (process.env.SUBSCRIPTIONS_PROVIDER || 'clerk').toLowerCase();
  return p === 'lemonsqueezy' ? 'lemonsqueezy' : 'clerk';
}

export async function setUserSubscription(
  userId: string,
  info: SubscriptionInfo
) {
  const provider = getProvider();
  if (provider === 'clerk') {
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        subscriptionTier: info.tier,
        subscriptionStatus: info.status,
        subscriptionCurrentPeriodEnd: info.currentPeriodEnd,
      },
    });
    return;
  }
  // lemonsqueezy: rely on webhook to set DB and any public metadata mirror if desired
}


