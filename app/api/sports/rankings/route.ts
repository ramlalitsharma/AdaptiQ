import { NextResponse } from 'next/server';
import { SportsService } from '@/lib/sports-service';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 't20';
  const women = searchParams.get('women') === '1';

  try {
    const data = await SportsService.fetchTeamRankings(format, women);
    
    if (!data) {
      return NextResponse.json({ error: 'Failed to fetch rankings telemetry' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
