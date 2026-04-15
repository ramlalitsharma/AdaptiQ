import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { logAdminAction } from '@/lib/admin-service';

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();

        // 1. Log the action before deletion (audit trail)
        await logAdminAction({
            adminId: userId,
            action: 'manual_adjustment',
            targetId: userId,
            targetType: 'user',
            details: 'User initiated self-deletion (GDPR Right to Erasure)',
            metadata: { timestamp: new Date() }
        });

        // 2. Delete all user-related data
        // In a production environment, we might want to "soft delete" first or use a queue
        await Promise.all([
            db.collection('users').deleteOne({ clerkId: userId }),
            db.collection('enrollments').deleteMany({ userId }),
            db.collection('userStats').deleteOne({ userId }),
            db.collection('activityFeed').deleteMany({ userId }),
            db.collection('learningPaths').deleteMany({ authorId: userId }),
            db.collection('notifications').deleteMany({ userId })
        ]);

        // Note: External providers like Clerk need to be handled via their API/Webhooks

        return NextResponse.json({ success: true, message: 'Account and data successfully scheduled for deletion.' });

    } catch (error: any) {
        console.error('GDPR Delete Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete account', message: error.message },
            { status: 500 }
        );
    }
}
