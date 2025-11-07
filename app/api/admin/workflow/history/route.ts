import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeContentVersion } from '@/lib/models/ContentVersion';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const contentType = searchParams.get('contentType');
    const contentId = searchParams.get('contentId');

    if (!contentType || !contentId) {
      return NextResponse.json({ error: 'contentType and contentId required' }, { status: 400 });
    }

    const db = await getDatabase();
    const versions = await db
      .collection('contentVersions')
      .find({ contentType, contentId })
      .sort({ version: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ history: versions.map((version: any) => serializeContentVersion(version)) });
  } catch (error: any) {
    console.error('Workflow history error:', error);
    return NextResponse.json({ error: 'Failed to load history', message: error.message }, { status: 500 });
  }
}
