import { getDatabase } from './mongodb';
import { ContentType } from './models/ContentVersion';

const STATUS_ORDER = ['draft', 'in_review', 'approved', 'published', 'archived'] as const;

export const WORKFLOW_STATUSES = STATUS_ORDER;

export function isValidStatus(status: string) {
  return STATUS_ORDER.includes(status as typeof STATUS_ORDER[number]);
}

export async function recordContentVersion({
  contentType,
  contentId,
  status,
  snapshot,
  changeNote,
  changedBy,
}: {
  contentType: ContentType;
  contentId: string;
  status: string;
  snapshot: any;
  changeNote?: string | null;
  changedBy: string;
}) {
  const db = await getDatabase();
  const versionNumber = (await db.collection('contentVersions').countDocuments({ contentType, contentId })) + 1;

  await db.collection('contentVersions').insertOne({
    contentType,
    contentId,
    version: versionNumber,
    status,
    snapshot,
    changeNote: changeNote || null,
    changedBy,
    createdAt: new Date(),
  });
}
