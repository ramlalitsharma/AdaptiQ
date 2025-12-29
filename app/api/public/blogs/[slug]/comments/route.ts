import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET: Fetch hierarchical comments for a blog post
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { slug } = await params;
        const db = await getDatabase();

        // Fetch all comments for this blog slug
        const comments = await db.collection('blog_comments')
            .find({ blogSlug: slug })
            .sort({ createdAt: 1 }) // Chronological order within each level
            .toArray();

        // Helper to build hierarchy
        const commentMap = new Map();
        const roots: any[] = [];

        comments.forEach(comment => {
            comment.replies = [];
            commentMap.set(comment._id.toString(), comment);
        });

        comments.forEach(comment => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId.toString());
                if (parent) {
                    parent.replies.push(comment);
                } else {
                    // Parent might have been deleted, treat as root or skip
                    roots.push(comment);
                }
            } else {
                roots.push(comment);
            }
        });

        return NextResponse.json({ comments: roots });
    } catch (error: any) {
        console.error('Error fetching comments:', error);
        return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
    }
}

// POST: Add a new comment or reply
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        const { content, parentId } = await req.json();

        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
        }

        const db = await getDatabase();

        const newComment: any = {
            blogSlug: slug,
            userId: user.id,
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
            userImage: (user as any).imageUrl || (user as any).image || '',
            content: content.trim(),
            parentId: (parentId && ObjectId.isValid(parentId)) ? new ObjectId(parentId) : null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await db.collection('blog_comments').insertOne(newComment);

        return NextResponse.json({
            success: true,
            comment: { ...newComment, _id: result.insertedId }
        });
    } catch (error: any) {
        console.error('Error posting comment:', error);
        return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    }
}

// DELETE: Remove a comment (requires ownership or admin)
// Note: In a production app, we might just "soft delete" to keep the thread structure
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const commentId = searchParams.get('commentId');
        if (!commentId) return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });

        const db = await getDatabase();
        const comment = await db.collection('blog_comments').findOne({ _id: new ObjectId(commentId) });

        if (!comment) return NextResponse.json({ error: 'Comment not found' }, { status: 404 });

        // Check ownership
        // For now, only the author can delete. Admins can be added later.
        if (comment.userId !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await db.collection('blog_comments').deleteOne({ _id: new ObjectId(commentId) });

        // Optional: Recursively delete replies or mark as "[Deleted]"
        // To keep it simple for now, we just delete the single comment.

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting comment:', error);
        return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }
}
