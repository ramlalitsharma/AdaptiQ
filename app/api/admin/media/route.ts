import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin-check';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const db = await getDatabase();
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const search = searchParams.get('search');

        let query: any = {};
        if (type && type !== 'all') {
            query.type = type;
        }
        if (search) {
            query.filename = { $regex: search, $options: 'i' };
        }

        const media = await db.collection('media')
            .find(query)
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        return NextResponse.json({ media });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

        const db = await getDatabase();
        // In a real app, we'd also delete the file from disk/S3
        await db.collection('media').deleteOne({ _id: id as any });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
