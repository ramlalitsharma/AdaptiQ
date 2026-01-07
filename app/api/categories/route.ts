import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { isAdmin } from '@/lib/admin-check';
import { ObjectId } from 'mongodb';

export async function GET() {
    try {
        const db = await getDatabase();
        const categories = await db
            .collection('courseCategories')
            .find({ isActive: true })
            .sort({ order: 1 })
            .toArray();

        return NextResponse.json({ categories });
    } catch (error: any) {
        console.error('Fetch categories error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!(await isAdmin())) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, slug, description, icon, order } = await req.json();

        if (!name || !slug) {
            return NextResponse.json(
                { error: 'Name and slug are required' },
                { status: 400 }
            );
        }

        const db = await getDatabase();
        const category = {
            name,
            slug,
            description,
            icon,
            order: order || 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.collection('courseCategories').insertOne(category);

        return NextResponse.json({
            success: true,
            category: { ...category, _id: result.insertedId }
        });
    } catch (error: any) {
        console.error('Create category error:', error);
        return NextResponse.json(
            { error: 'Failed to create category', message: error.message },
            { status: 500 }
        );
    }
}
