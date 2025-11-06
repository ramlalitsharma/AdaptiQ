import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, courseId, courseTitle } = body as {
      type: 'course_completion' | 'quiz_completed' | 'achievement';
      courseId?: string;
      courseTitle?: string;
    };

    const user = await currentUser();
    if (!user?.email) return NextResponse.json({ error: 'User email not found' }, { status: 400 });

    // In production, use a service like SendGrid, Resend, or AWS SES
    // For now, we'll log and store the notification
    const db = await getDatabase();
    const notifications = db.collection('notifications');
    
    const notification = {
      userId,
      email: user.email,
      type,
      courseId,
      courseTitle,
      sent: false, // Set to true when actually sent via email service
      createdAt: new Date(),
    };

    await notifications.insertOne(notification);

    // TODO: Integrate with email service
    // Example with Resend:
    // await fetch('https://api.resend.com/emails', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     from: 'AdaptIQ <noreply@adaptiq.com>',
    //     to: user.email,
    //     subject: type === 'course_completion' ? `Congratulations! You completed ${courseTitle}` : 'AdaptIQ Notification',
    //     html: generateEmailHTML(type, courseTitle),
    //   }),
    // });

    return NextResponse.json({ success: true, message: 'Notification queued' });
  } catch (e: any) {
    console.error('Email notification error:', e);
    return NextResponse.json({ error: 'Failed to send notification', message: e.message }, { status: 500 });
  }
}

