import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin } from '@/lib/admin-check';

export const runtime = 'nodejs';

function normalizeUserQuery(userId: string) {
  if (ObjectId.isValid(userId)) {
    return { $or: [{ _id: new ObjectId(userId) }, { clerkId: userId }] };
  }
  return { clerkId: userId };
}

function mapRoleIds(roleIds: any[]): ObjectId[] {
  return roleIds
    .map((id) => {
      if (id instanceof ObjectId) return id;
      if (typeof id === 'string' && ObjectId.isValid(id)) return new ObjectId(id);
      return null;
    })
    .filter((id): id is ObjectId => Boolean(id));
}

// GET - Get user by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { userId } = await params;
    const db = await getDatabase();

    const user = await db.collection('users').findOne(normalizeUserQuery(userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    delete (user as any).password;
    return NextResponse.json(user);
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to fetch user', message: e.message }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { userId } = await params;
    const body = await req.json();
    const { name, email, subscriptionStatus, isAdmin, isBanned, roleIds } = body;

    const db = await getDatabase();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
    if (isBanned !== undefined) updateData.isBanned = isBanned;
    if (Array.isArray(roleIds)) {
      updateData.roleIds = mapRoleIds(roleIds);
    }

    const query = normalizeUserQuery(userId);
    const result = await db.collection('users').updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to update user', message: e.message }, { status: 500 });
  }
}

// DELETE - Delete user (soft delete by banning)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await requireAdmin();

    const { userId } = await params;
    const db = await getDatabase();

    const query = normalizeUserQuery(userId);

    const result = await db.collection('users').updateOne(query, {
      $set: { isBanned: true, deletedAt: new Date() },
    });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User banned successfully' });
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to ban user', message: e.message }, { status: 500 });
  }
}

