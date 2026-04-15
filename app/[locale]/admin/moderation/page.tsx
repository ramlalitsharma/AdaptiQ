import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { ModerationQueue } from '@/components/admin/ModerationQueue';

export const dynamic = 'force-dynamic';

interface ModerationReview {
  id: string;
  courseSlug: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  userName?: string;
}

interface ModerationTicket {
  id: string;
  subject: string;
  email: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default async function ModerationPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();

  const pendingReviews = await db
    .collection('reviews')
    .aggregate([
      { $match: { status: 'pending' } },
      { $sort: { createdAt: -1 } },
      { $limit: 25 },
      {
        $lookup: {
          from: 'users',
          let: { reviewUserId: '$userId' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$clerkId', '$$reviewUserId'] },
                    {
                      $and: [
                        { $ifNull: ['$_id', false] },
                        { $eq: [{ $toString: '$_id' }, '$$reviewUserId'] },
                      ],
                    },
                  ],
                },
              },
            },
            { $project: { name: 1, email: 1 } },
          ],
          as: 'user',
        },
      },
      {
        $addFields: {
          userName: {
            $cond: [
              { $gt: [{ $size: '$user' }, 0] },
              { $ifNull: [{ $first: '$user.name' }, { $first: '$user.email' }] },
              '$userId',
            ],
          },
        },
      },
    ])
    .toArray();

  const openTickets = await db
    .collection('supportTickets')
    .find({ status: { $in: ['open', 'in_review'] } })
    .sort({ createdAt: -1 })
    .limit(25)
    .toArray();

  const reviewSummaries: ModerationReview[] = pendingReviews.map((review: any) => ({
    id: review._id.toString(),
    courseSlug: review.courseSlug,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
    userName: review.userName,
  }));

  const ticketSummaries: ModerationTicket[] = openTickets.map((ticket: any) => ({
    id: ticket._id.toString(),
    subject: ticket.subject,
    email: ticket.email,
    message: ticket.message,
    status: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.createdAt instanceof Date ? ticket.createdAt.toISOString() : ticket.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex items-center justify-between px-4 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Moderation Center</h1>
            <p className="text-sm text-slate-500">
              Review student feedback and manage support tickets in one workspace.
            </p>
          </div>
          <NotificationBell />
        </div>
      </header>
      <main className="container mx-auto px-4 py-10">
        <ModerationQueue initialReviews={reviewSummaries} initialTickets={ticketSummaries} />
      </main>
    </div>
  );
}
