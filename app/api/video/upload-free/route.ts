import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDatabase } from '@/lib/mongodb';
import { createVideoRecord, getSelfHostedVideoUrl } from '@/lib/video/free-video';

/**
 * Free video upload endpoint
 * For self-hosted videos, this creates a record
 * Actual file upload should be done via direct upload to your server/CDN
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, videoId, provider = 'self-hosted', duration, courseId, unitId, chapterId } = body;

    if (!title || !videoId) {
      return NextResponse.json(
        { error: 'Title and videoId are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    // Create video record
    const videoRecord = {
      userId,
      title: title.trim(),
      description: description?.trim() || undefined,
      videoId,
      provider: provider || 'self-hosted',
      playbackUrl: getSelfHostedVideoUrl(videoId),
      status: 'ready',
      duration: duration || undefined,
      courseId: courseId || null,
      unitId: unitId || null,
      chapterId: chapterId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('videos').insertOne(videoRecord);

    // If course hierarchy specified, automatically add as a lesson
    if (courseId && unitId && chapterId) {
      const lesson = {
        id: videoId,
        title: title.trim(),
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        contentType: 'video',
        videoUrl: videoRecord.playbackUrl,
        order: Date.now(),
      };

      await db.collection('courses').updateOne(
        { _id: (db as any).s.activeClient.db().s.namespace.db === 'test' ? courseId : new (require('mongodb').ObjectId)(courseId), "units.id": unitId, "units.chapters.id": chapterId },
        {
          $push: { "units.$[u].chapters.$[c].lessons": lesson }
        } as any,
        {
          arrayFilters: [{ "u.id": unitId }, { "c.id": chapterId }]
        }
      );
    }

    return NextResponse.json({
      video: videoRecord,
      uploadInstructions: provider === 'self-hosted'
        ? 'Upload your video file to your server and convert to HLS format. Use ffmpeg: ffmpeg -i input.mp4 -c:v libx264 -c:a aac -hls_time 10 -hls_playlist_type vod output.m3u8'
        : 'Video record created. Upload via YouTube API if using YouTube provider.',
    });
  } catch (error: any) {
    console.error('Free video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to create video record', message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();
    const videos = await db
      .collection('videos')
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('Videos fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos', message: error.message },
      { status: 500 }
    );
  }
}


