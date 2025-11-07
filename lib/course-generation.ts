import { openai } from '@/lib/openai';

export interface GenerateCourseParams {
  title: string;
  subject?: string;
  level?: 'basic' | 'intermediate' | 'advanced';
  audience?: string;
  goals?: string;
  tone?: string;
  modulesCount?: number;
  lessonsPerModule?: number;
}

export async function generateCourseOutlineAI(params: GenerateCourseParams) {
  const { title, subject, level, audience, goals, tone, modulesCount, lessonsPerModule } = params;
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const prompt = `You are an instructional designer building a detailed online course outline.
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
