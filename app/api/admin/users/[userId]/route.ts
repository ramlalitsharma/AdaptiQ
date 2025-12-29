import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { requireAdmin, getUserRole, requireSuperAdmin } from '@/lib/admin-check';

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

    // Check if manager is admin/superadmin
    const managerRole = await getUserRole();
    if (managerRole !== 'admin' && managerRole !== 'superadmin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await req.json();
    const { firstName, lastName, email, role, password, subscriptionStatus, isBanned } = body;

    const db = await getDatabase();
    const query = normalizeUserQuery(userId);
    const targetUser = await db.collection('users').findOne(query);

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const client = await clerkClient();
    const clerkId = targetUser.clerkId;

    // 1. Update Clerk if necessary
    const clerkUpdate: any = {};
    if (firstName !== undefined) clerkUpdate.firstName = firstName;
    if (lastName !== undefined) clerkUpdate.lastName = lastName;
    if (email !== undefined) clerkUpdate.emailAddress = [email];
    if (password !== undefined && password.trim() !== '') {
      clerkUpdate.password = password;
      clerkUpdate.password_compromised = true; // Force change on next login
    }

    // Sync roles to Clerk publicMetadata
    if (role !== undefined) {
      clerkUpdate.publicMetadata = {
        ...(targetUser.publicMetadata || {}),
        role,
        isSuperAdmin: role === 'superadmin',
        isAdmin: role === 'admin' || role === 'superadmin',
        isTeacher: role === 'teacher' || role === 'admin' || role === 'superadmin',
      };
    }

    if (Object.keys(clerkUpdate).length > 0) {
      try {
        await client.users.updateUser(clerkId, clerkUpdate);
      } catch (clerkError: any) {
        console.error('Clerk update error:', clerkError);
        return NextResponse.json({ error: 'Failed to update user in Clerk', message: clerkError.message }, { status: 400 });
      }
    }

    // 2. Update MongoDB
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (firstName !== undefined || lastName !== undefined) {
      updateData.name = `${firstName || targetUser.firstName || ''} ${lastName || targetUser.lastName || ''}`.trim() || email || targetUser.email;
    }
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (role !== undefined) {
      updateData.role = role;
      updateData.isSuperAdmin = role === 'superadmin';
      updateData.isAdmin = role === 'admin' || role === 'superadmin';
      updateData.isTeacher = role === 'teacher' || role === 'admin' || role === 'superadmin';
    }
    if (subscriptionStatus !== undefined) updateData.subscriptionStatus = subscriptionStatus;
    if (isBanned !== undefined) updateData.isBanned = isBanned;

    const result = await db.collection('users').updateOne(query, { $set: updateData });

    return NextResponse.json({ success: true, message: 'User updated successfully' });
  } catch (e: any) {
    console.error('Update user error:', e);
    return NextResponse.json({ error: 'Failed to update user', message: e.message }, { status: 500 });
  }
}

// DELETE - Delete user (hard delete for superadmin, soft delete for admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const managerRole = await getUserRole();
    if (!managerRole) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { userId } = await params;
    const db = await getDatabase();
    const query = normalizeUserQuery(userId);

    // Get the target user to check their role
    const targetUser = await db.collection('users').findOne(query);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetRole = (targetUser as any).role || 'student';

    // Only superadmin can delete users
    if (managerRole !== 'superadmin') {
      return NextResponse.json({ error: 'Only superadmin can delete users' }, { status: 403 });
    }

    // Prevent deleting other superadmins
    if (targetRole === 'superadmin') {
      return NextResponse.json({ error: 'Cannot delete superadmin users' }, { status: 403 });
    }

    // Prevent deleting yourself
    if (targetUser.clerkId === currentUserId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 });
    }

    const client = await clerkClient();

    // Hard delete: Remove from MongoDB and Clerk
    try {
      // Delete from Clerk
      try {
        await client.users.deleteUser(targetUser.clerkId);
      } catch (clerkError: any) {
        console.warn('Failed to delete user from Clerk:', clerkError.message);
        // Continue with MongoDB deletion even if Clerk deletion fails
      }

      // Delete from MongoDB
      const result = await db.collection('users').deleteOne(query);

      if (result.deletedCount === 0) {
        return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
      }

      // Also clean up related data (optional - you may want to keep enrollments, progress, etc.)
      // Uncomment if you want to delete related data:
      // await db.collection('enrollments').deleteMany({ userId: targetUser.clerkId });
      // await db.collection('userProgress').deleteMany({ userId: targetUser.clerkId });

      return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (deleteError: any) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user', message: deleteError.message },
        { status: 500 }
      );
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to delete user', message: e.message }, { status: 500 });
  }
}

