import { ObjectId } from 'mongodb';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface CourseReview {
  _id?: ObjectId;
  courseSlug: string;
  userId: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt: Date;
  updatedAt: Date;
  moderatedAt?: Date;
  moderatedBy?: string;
  moderationNote?: string;
}

export function serializeReview(review: CourseReview & { _id?: any }) {
  return {
    id: review._id ? String(review._id) : undefined,
    courseSlug: review.courseSlug,
    userId: review.userId,
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    createdAt: review.createdAt instanceof Date ? review.createdAt.toISOString() : review.createdAt,
    updatedAt: review.updatedAt instanceof Date ? review.updatedAt.toISOString() : review.updatedAt,
    moderatedAt:
      review.moderatedAt instanceof Date ? review.moderatedAt.toISOString() : review.moderatedAt,
    moderatedBy: review.moderatedBy || '',
    moderationNote: review.moderationNote || '',
  };
}
