import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth, currentUser } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const db = await getDatabase();
    const comments = await db
      .collection('news_comments')
      .find({ newsSlug: slug })
      .sort({ createdAt: 1 })
      .toArray();

    const map = new Map<string, any>();
    const roots: any[] = [];

    comments.forEach((c: any) => {
      c.replies = [];
      map.set(c._id.toString(), c);
    });

    comments.forEach((c: any) => {
      if (c.parentId) {
        const parent = map.get(c.parentId.toString());
        if (parent) {
          parent.replies.push(c);
        } else {
          roots.push(c);
        }
      } else {
        roots.push(c);
      }
    });

    return NextResponse.json({ comments: roots });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

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
    const doc: any = {
      newsSlug: slug,
      userId: user.id,
      userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous',
      userImage: (user as any).imageUrl || (user as any).image || '',
      content: content.trim(),
      parentId: parentId && ObjectId.isValid(parentId) ? new ObjectId(parentId) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await db.collection('news_comments').insertOne(doc);

    return NextResponse.json({ success: true, comment: { ...doc, _id: result.insertedId } });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('commentId');
    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID required' }, { status: 400 });
    }
    const db = await getDatabase();
    const existing = await db.collection('news_comments').findOne({ _id: new ObjectId(commentId) });
    if (!existing) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }
    if (existing.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await db.collection('news_comments').deleteOne({ _id: new ObjectId(commentId) });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}
