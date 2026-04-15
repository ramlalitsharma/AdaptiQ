import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { LiveClassroomWrapper } from '@/components/live/LiveClassroomWrapper';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { Card, CardContent } from '@/components/ui/Card';
import { getProviderRoomConfig } from '@/lib/live/live-provider-adapter';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface LiveRoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function LiveRoomPage({ params }: LiveRoomPageProps) {
  const { roomId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const db = await getDatabase();
  const room = await db.collection('liveRooms').findOne({ roomId });

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Room Not Found</h1>
            <p className="text-slate-600">The live classroom room could not be found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Enrollment gate
  let isAuthorized = false;
  if (room.createdBy === userId) {
    isAuthorized = true;
  } else if (room.courseId) {
    const enrollment = await db.collection('enrollments').findOne({
      userId,
      courseId: String(room.courseId),
      status: 'approved',
    });
    const completion = await db.collection('courseCompletions').findOne({
      userId,
      courseId: String(room.courseId),
    });
    isAuthorized = Boolean(enrollment || completion);
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center space-y-3">
            <h1 className="text-2xl font-bold">Enrollment Required</h1>
            <p className="text-slate-600">You must be enrolled in this course to access the live classroom.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use the provider adapter to handle diverse meeting types
  const provider = (room.provider as any) || 'jitsi';
  const { roomUrl, isEmbeddable } = getProviderRoomConfig({
    provider,
    roomName: room.roomName,
    meetingLink: room.roomUrl,
  });

  // Check if class has ended
  if (room.status === 'ended') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center p-8 shadow-xl">
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">🏁</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Class Ended</h1>
          <p className="text-slate-600 mb-8">
            This live session has finished. You can return to the course to view other materials or wait for the recording to be processed.
          </p>

          <div className="flex flex-col gap-3">
            {room.courseId ? (
              <Link href={`/admin/courses/${room.courseId}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  {room.createdBy === userId ? 'Return to Studio' : 'Back to Course'}
                </Button>
              </Link>
            ) : (
              <Link href="/live">
                <Button variant="outline" className="w-full">
                  Browse Live Classes
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Live Classes', href: '/live' },
            { label: room.roomName || 'Classroom' },
          ]}
        />

        <div className="max-w-7xl mx-auto">
          {!isEmbeddable ? (
            <Card className="overflow-hidden border-none shadow-2xl bg-white">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                <h2 className="text-3xl font-bold mb-2">{room.roomName}</h2>
                <div className="flex items-center justify-between text-blue-100 opacity-90">
                  <p>This session is hosted on {provider.toUpperCase()}</p>
                  {room.createdBy === userId && (
                    <Link href="/admin/courses" className="text-white underline hover:text-blue-200 text-sm font-bold">
                      ← Return to Studio
                    </Link>
                  )}
                </div>
              </div>
              <CardContent className="p-12 text-center space-y-8">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="text-5xl mb-6">🚀</div>
                  <h3 className="text-xl font-semibold text-slate-900">Ready to join your class?</h3>
                  <p className="text-slate-600">
                    Click the button below to launch the meeting in {provider === 'zoom' ? 'Zoom' : 'Google Meet'}.
                    Attendance will be tracked automatically upon clicking.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <a
                    href={roomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Button size="lg" className="px-12 py-6 text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-xl transition-all hover:scale-105">
                      Launch Class Now
                    </Button>
                  </a>
                  <p className="text-xs text-slate-400">
                    Trouble opening? Copy and paste this link: <br />
                    <span className="select-all font-mono text-blue-500">{roomUrl}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <LiveClassroomWrapper
              roomId={roomId}
              roomUrl={roomUrl}
              roomName={room.roomName}
              isInstructor={room.createdBy === userId}
              provider={provider as 'jitsi' | 'daily'}
              courseId={room.courseId}
              initialStatus={room.status || 'scheduled'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

