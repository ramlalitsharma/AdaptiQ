export type EnrollmentStatus = 'pending' | 'approved' | 'waitlisted' | 'rejected';

export interface EnrollmentRecord {
  _id?: any;
  userId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  status: EnrollmentStatus;
  cohort?: string | null;
  waitlistPosition?: number | null;
  notes?: string | null;
  requestedAt: Date;
  decidedAt?: Date | null;
  adminId?: string | null;
  history?: Array<{
    status: EnrollmentStatus;
    changedAt: Date;
    adminId?: string | null;
    note?: string | null;
  }>;
}

export function serializeEnrollment(record: EnrollmentRecord & { _id?: any }) {
  return {
    id: record._id ? String(record._id) : undefined,
    userId: record.userId,
    courseId: record.courseId,
    courseSlug: record.courseSlug,
    courseTitle: record.courseTitle,
    status: record.status,
    cohort: record.cohort || null,
    waitlistPosition: record.waitlistPosition ?? null,
    notes: record.notes || null,
    requestedAt: record.requestedAt instanceof Date ? record.requestedAt.toISOString() : record.requestedAt,
    decidedAt: record.decidedAt instanceof Date ? record.decidedAt.toISOString() : record.decidedAt || null,
    adminId: record.adminId || null,
  };
}
