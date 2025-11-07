import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { auth } from '@/lib/auth';
import { Course } from '@/lib/models/Course';
import { openai } from '@/lib/openai';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      mode,
      title,
      subject,
      level,
      outline,
      summary,
      audience,
      goals,
      tone,
      modulesCount,
      lessonsPerModule,
    } = body as {
      mode: 'ai' | 'manual';
      title?: string;
      subject?: string;
      level?: 'basic' | 'intermediate' | 'advanced';
      outline?: any;
      summary?: string;
      audience?: string;
      goals?: string;
      tone?: string;
      modulesCount?: number;
      lessonsPerModule?: number;
    };

    const db = await getDatabase();
    const col = db.collection<Course>('courses');

    let course: Course | null = null;

    const metadata = {
      audience,
      goals,
      tone,
      modulesCount: modulesCount ? Number(modulesCount) : undefined,
      lessonsPerModule: lessonsPerModule ? Number(lessonsPerModule) : undefined,
    };

    if (mode === 'manual') {
      if (!title || !outline) return NextResponse.json({ error: 'title and outline required' }, { status: 400 });
      course = buildCourseFromOutline(userId, title, subject, level, outline, summary, metadata);
    } else {
      if (!title) return NextResponse.json({ error: 'title required for AI mode' }, { status: 400 });
      const generated = await generateCourseOutlineAI({
        title,
        subject,
        level,
        audience,
        goals,
        tone,
        modulesCount,
        lessonsPerModule,
      });
      course = buildCourseFromOutline(userId, title, subject, level, generated, summary, metadata);
    }

    await col.insertOne(course);
    return NextResponse.json({ course });
  } catch (e: any) {
    console.error('Create course failed:', e);
    return NextResponse.json({ error: 'Failed to create course', message: e.message }, { status: 500 });
  }
}

function buildCourseFromOutline(
  authorId: string,
  title: string,
  subject: string | undefined,
  level: 'basic' | 'intermediate' | 'advanced' | undefined,
  outline: any,
  summary?: string,
  metadata?: Course['metadata'],
): Course {
  const now = new Date().toISOString();
  const modules = (outline.modules || outline || []).map((m: any, mi: number) => ({
    id: `m${mi + 1}`,
    title: m.title || `Module ${mi + 1}`,
    slug: (m.title || `module-${mi + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    lessons: (m.lessons || []).map((l: any, li: number) => ({
      id: `m${mi + 1}-l${li + 1}`,
      title: l.title || `Lesson ${li + 1}`,
      slug: (l.title || `lesson-${li + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      content: l.content,
    })),
  }));
  return {
    authorId,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    summary,
    subject,
    level,
    modules,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    metadata,
  };
}

async function generateCourseOutlineAI({
  title,
  subject,
  level,
  audience,
  goals,
  tone,
  modulesCount,
  lessonsPerModule,
}: {
  title: string;
  subject?: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  audience?: string;
  goals?: string;
  tone?: string;
  modulesCount?: number;
  lessonsPerModule?: number;
}) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const prompt = `You are an instructional designer building a detailed course outline.
Course title: ${title}
${subject ? `Subject focus: ${subject}
` : ''}${level ? `Difficulty: ${level}
` : ''}${audience ? `Target audience: ${audience}
` : ''}${goals ? `Learning outcomes: ${goals}
` : ''}${tone ? `Tone: ${tone}
` : ''}${modulesCount ? `Number of modules: ${modulesCount}
` : ''}${lessonsPerModule ? `Lessons per module: ${lessonsPerModule}
` : ''}
Return JSON in the shape {"modules":[{"title":"","lessons":[{"title":"","content":"bullet outline"}]}]}. Keep lesson content succinct bullet-style summaries.`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });
  const content = resp.choices[0]?.message?.content || '{}';
  return JSON.parse(content);
}


