export type ContentType = 'course' | 'blog';

export interface ContentVersion {
  _id?: any;
  contentType: ContentType;
  contentId: string;
  version: number;
  status: string;
  snapshot: any;
  changeNote?: string | null;
  changedBy: string;
  createdAt: Date;
}

export function serializeContentVersion(version: ContentVersion & { _id?: any }) {
  return {
    id: version._id ? String(version._id) : undefined,
    contentType: version.contentType,
    contentId: version.contentId,
    version: version.version,
    status: version.status,
    snapshot: version.snapshot,
    changeNote: version.changeNote || null,
    changedBy: version.changedBy,
    createdAt: version.createdAt instanceof Date ? version.createdAt.toISOString() : version.createdAt,
  };
}
