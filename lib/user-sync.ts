import { auth, currentUser } from '@clerk/nextjs/server';
import { getDatabase } from './mongodb';
import { User } from './models/User';

/**
 * Manually sync user from Clerk to MongoDB
 * This is used for local development when webhooks aren't set up
 * Call this after user signs in to ensure they exist in MongoDB
 */
export async function syncUserToDatabase(): Promise<User | null> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return null;
    }

    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ clerkId: userId });

    if (existingUser) {
      // Update user info if needed
      await usersCollection.updateOne(
        { clerkId: userId },
        {
          $set: {
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
            updatedAt: new Date(),
          },
        }
      );
      return existingUser;
    }

    // Create new user
    const newUser: User = {
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      subscriptionTier: (clerkUser.publicMetadata?.subscriptionTier as 'free' | 'premium') || 'free',
      subscriptionStatus: clerkUser.publicMetadata?.subscriptionStatus as string,
      subscriptionCurrentPeriodEnd: clerkUser.publicMetadata?.subscriptionCurrentPeriodEnd
        ? new Date(clerkUser.publicMetadata.subscriptionCurrentPeriodEnd as string)
        : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      learningProgress: {
        totalQuizzesTaken: 0,
        averageScore: 0,
        masteryLevel: 0,
        knowledgeGaps: [],
      },
      preferences: {
        difficultyPreference: 'adaptive',
        language: 'en',
      },
    };

    await usersCollection.insertOne(newUser);
    return newUser;
  } catch (error) {
    console.error('Error syncing user to database:', error);
    return null;
  }
}
