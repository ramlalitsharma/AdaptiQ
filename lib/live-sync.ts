
import { getDatabase } from '@/lib/mongodb';
import { Course } from '@/lib/models/Course';

export async function syncLiveRooms(courseId: string, units: any[]) {
    try {
        const db = await getDatabase();

        // 1. Flatten all lessons from the hierarchy
        const lessons: any[] = [];
        units.forEach(unit => {
            (unit.chapters || []).forEach((chapter: any) => {
                (chapter.lessons || []).forEach((lesson: any) => {
                    lessons.push(lesson);
                });
            });
        });

        // 2. Find lessons with live room configuration
        const liveLessons = lessons.filter(l =>
            l.contentType === 'live' &&
            l.liveRoomConfig &&
            l.liveRoomId
        );

        // 3. Upsert each live room
        for (const lesson of liveLessons) {
            const config = lesson.liveRoomConfig;

            // Construct scheduled date object
            const scheduledDateTime = new Date(`${config.scheduledDate}T${config.scheduledTime}`);

            const liveRoom = {
                roomId: lesson.liveRoomId, // Use the ID generated in frontend
                roomName: config.roomName,
                courseId: courseId, // String ID
                lessonId: lesson.id,
                scheduledTime: scheduledDateTime,
                duration: config.duration || 90,
                status: 'scheduled', // Pending start
                // Don't overwrite existing fields if they exist
                // createdAt: new Date(), 
                updatedAt: new Date(),
            };

            // Upsert: Update if exists (by roomId), otherwise insert
            await db.collection('liveRooms').updateOne(
                { roomId: lesson.liveRoomId },
                {
                    $set: liveRoom,
                    $setOnInsert: { created_at: new Date(), attendees: [], resources: [] }
                },
                { upsert: true }
            );
        }

        console.log(`Synced ${liveLessons.length} live rooms for course ${courseId}`);
        return true;

    } catch (error) {
        console.error('Error syncing live rooms:', error);
        return false;
    }
}
