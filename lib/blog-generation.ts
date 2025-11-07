import { openai } from '@/lib/openai';

export interface GenerateBlogParams {
  topic: string;
  audience?: string;
  tone?: string;
  callToAction?: string;
  keywords?: string[];
}

export async function generateBlogMarkdownAI(params: GenerateBlogParams) {
  const { topic, audience, tone, callToAction, keywords } = params;
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const prompt = `Write a comprehensive, well-structured blog post in Markdown.
Topic: ${topic}
${audience ? `Audience: ${audience}
` : ''}${tone ? `Tone: ${tone}
` : ''}${callToAction ? `Call to action: ${callToAction}
` : ''}${keywords && keywords.length ? `Keywords: ${keywords.join(', ')}
` : ''}
Include clear headings, short paragraphs, bullet lists when helpful, and a concluding CTA. Provide YAML frontmatter summary at the top.`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  const content = resp.choices[0]?.message?.content || '# Draft\nComing soon.';
  return content;
}
