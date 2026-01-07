export interface CourseLesson {
  id: string;
  title: string;
  slug: string;
  contentType: 'video' | 'live' | 'quiz' | 'document' | 'text';
  content?: string;
  videoUrl?: string;           // For video content
  liveRoomId?: string;         // For live session integration
  resources?: { type: 'link' | 'pdf' | 'video'; url: string; title?: string }[];
  quiz?: { questions: any[] };
  order: number;
}

export interface CourseChapter {
  id: string;
  title: string;
  slug: string;
  description?: string;
  lessons: CourseLesson[];
  order: number;
}

export interface CourseUnit {
  id: string;
  title: string;
  slug: string;
  description?: string;
  chapters: CourseChapter[];
  order: number;
}

export interface Course {
  _id?: string;
  authorId: string;
  categoryId?: string;       // Linked category ID
  title: string;
  slug: string;
  summary?: string;
  description?: string;
  thumbnail?: string;
  subject?: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  language?: string;
  tags?: string[];
  units: CourseUnit[];       // Evolved from modules
  status: 'draft' | 'in_review' | 'approved' | 'published' | 'archived' | 'scheduled';
  scheduledAt?: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  metadata?: {
    audience?: string;
    goals?: string;
    tone?: string;
    unitsCount?: number;
    chaptersCount?: number;
    lessonsCount?: number;
  };
  resources?: Array<{
    type: 'video' | 'pdf' | 'link' | 'image';
    label: string;
    url: string;
  }>;
  price?: {
    currency: string;
    amount: number;
    plan?: string;
  };
  createdAt: string;
  updatedAt: string;
}


