import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/auth';

export async function POST(
    req: NextRequest,
    { params }: { params: { roomId: string } }
) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { roomId } = params;
        const db = await getDatabase();

        // Update room status to live
        const result = await db.collection('liveRooms').findOneAndUpdate(
            { roomId },
            {
                $set: {
                    status: 'live',
                    startedAt: new Date(),
                },
            },
            { returnDocument: 'after' }
        );

        if (!result.value) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Generate Jitsi room URL
        const jitsiDomain = process.env.NEXT_PUBLIC_JITSI_DOMAIN || 'meet.jit.si';
        const roomUrl = `https://${jitsiDomain}/${roomId}`;

        return NextResponse.json({
            success: true,
            roomUrl,
            room: result.value,
        });
    } catch (error) {
        console.error('Error starting class:', error);
        return NextResponse.json(
            { error: 'Failed to start class' },
            { status: 500 }
        );
    }
}
