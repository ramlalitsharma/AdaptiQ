import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { User } from '@/lib/models/User';

export async function POST(req: NextRequest) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  // Webhook secret is optional for local development
  // For production, webhooks will be configured later
  if (!WEBHOOK_SECRET) {
    console.warn('⚠️ CLERK_WEBHOOK_SECRET not set - webhooks disabled for local development');
    return NextResponse.json(
      { 
        message: 'Webhook secret not configured. Set CLERK_WEBHOOK_SECRET in .env.local for production.',
        note: 'For local development, users will be created manually on first login.'
      },
      { status: 200 }
    );
  }

  // Get the Svix headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- no svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error verifying webhook' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name } = evt.data;

    // Create user in MongoDB
    const db = await getDatabase();
    const usersCollection = db.collection<User>('users');

    await usersCollection.insertOne({
      clerkId: id,
      email: email_addresses[0]?.email_address || '',
      name: `${first_name || ''} ${last_name || ''}`.trim(),
      subscriptionTier: 'free',
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
    } as User);
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, public_metadata } = evt.data;

    // Update user in MongoDB
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    await usersCollection.updateOne(
      { clerkId: id },
      {
        $set: {
          email: email_addresses[0]?.email_address || '',
          subscriptionTier: public_metadata?.subscriptionTier || 'free',
          subscriptionStatus: public_metadata?.subscriptionStatus,
          subscriptionCurrentPeriodEnd: public_metadata?.subscriptionCurrentPeriodEnd
            ? new Date(String(public_metadata.subscriptionCurrentPeriodEnd))
            : undefined,
          updatedAt: new Date(),
        },
      }
    );
  }

  return NextResponse.json({ received: true });
}
