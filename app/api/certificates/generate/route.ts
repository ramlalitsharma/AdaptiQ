import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { courseId, courseTitle } = body as { courseId: string; courseTitle: string };

    const user = await currentUser();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 400 });

    const db = await getDatabase();
    const certificates = db.collection('certificates');

    // Generate certificate ID
    const certId = crypto.randomBytes(16).toString('hex');
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year validity

    const certificate = {
      id: certId,
      userId,
      userName: user.firstName || user.email || 'Learner',
      courseId,
      courseTitle,
      issuedAt,
      expiresAt,
      verificationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://adaptiq.com'}/certificates/verify/${certId}`,
      createdAt: issuedAt,
    };

    await certificates.insertOne(certificate);

    // Trigger email notification
    try {
      await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/notifications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'course_completion', courseId, courseTitle }),
      });
    } catch (e) {
      console.warn('Failed to send completion email:', e);
    }

    return NextResponse.json({ certificate });
  } catch (e: any) {
    console.error('Certificate generation error:', e);
    return NextResponse.json({ error: 'Failed to generate certificate', message: e.message }, { status: 500 });
  }
}

