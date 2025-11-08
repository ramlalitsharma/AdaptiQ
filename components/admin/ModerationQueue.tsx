'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface ModerationReview {
  id: string;
  courseSlug: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
  userName?: string;
  moderationNote?: string;
}

interface ModerationTicket {
  id: string;
  subject: string;
  email: string;
  message: string;
  status: string;
  priority: string;
  createdAt: string;
  resolutionNote?: string;
}

interface ModerationQueueProps {
  initialReviews: ModerationReview[];
  initialTickets: ModerationTicket[];
}

export function ModerationQueue({ initialReviews, initialTickets }: ModerationQueueProps) {
  const [tab, setTab] = useState<'reviews' | 'tickets'>('reviews');
  const [reviews, setReviews] = useState(initialReviews);
  const [tickets, setTickets] = useState(initialTickets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'reviews') {
        const res = await fetch('/api/admin/moderation/reviews');
        if (!res.ok) throw new Error('Failed to refresh reviews');
        const data = await res.json();
        setReviews(data.reviews);
      } else {
        const res = await fetch('/api/admin/moderation/tickets');
        if (!res.ok) throw new Error('Failed to refresh tickets');
        const data = await res.json();
        setTickets(data.tickets);
      }
    } catch (err: any) {
      setError(err.message || 'Unable to refresh');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (id: string, status: 'approved' | 'rejected' | 'flagged') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/moderation/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update review');
      setReviews((prev) => prev.filter((review) => review.id !== id));
    } catch (err: any) {
      setError(err.message || 'Unable to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketAction = async (id: string, status: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/moderation/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
    } catch (err: any) {
      setError(err.message || 'Unable to update ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button variant={tab === 'reviews' ? 'inverse' : 'outline'} size="sm" onClick={() => setTab('reviews')}>
            Reviews ({reviews.length})
          </Button>
          <Button variant={tab === 'tickets' ? 'inverse' : 'outline'} size="sm" onClick={() => setTab('tickets')}>
            Support Tickets ({tickets.length})
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {tab === 'reviews' ? (
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No reviews awaiting moderation.
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{review.userName || 'Learner'}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(review.createdAt).toLocaleString()} • Course: {review.courseSlug}
                    </div>
                  </div>
                  <Badge variant="warning">{review.status}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i}>{i <= review.rating ? '★' : '☆'}</span>
                  ))}
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="inverse" size="sm" onClick={() => handleReviewAction(review.id, 'approved')}>
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleReviewAction(review.id, 'rejected')}>
                    Reject
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleReviewAction(review.id, 'flagged')}>
                    Flag
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
              No support tickets pending review.
            </div>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{ticket.subject}</div>
                    <div className="text-xs text-slate-500">
                      {ticket.email} • {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">{ticket.priority}</Badge>
                    <Badge variant="warning">{ticket.status}</Badge>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-line text-sm text-slate-600">{ticket.message}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="inverse" size="sm" onClick={() => handleTicketAction(ticket.id, 'in_review')}>
                    In Review
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleTicketAction(ticket.id, 'resolved')}>
                    Resolve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleTicketAction(ticket.id, 'rejected')}>
                    Reject
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleTicketAction(ticket.id, 'spam')}>
                    Mark Spam
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
