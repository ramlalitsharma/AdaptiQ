import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { serializeSupportTicket } from '@/lib/models/SupportTicket';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') || 'open';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const matchStage: Record<string, any> = {};
    if (statusParam !== 'all') {
      matchStage.status = statusParam;
    }

    const db = await getDatabase();
    const tickets = await db
      .collection('supportTickets')
      .find(matchStage)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({
      tickets: tickets.map((ticket: any) => serializeSupportTicket(ticket)),
    });
  } catch (error: any) {
    console.error('Support tickets moderation fetch error:', error);
    return NextResponse.json({ error: 'Failed to load tickets', message: error.message }, { status: 500 });
  }
}
