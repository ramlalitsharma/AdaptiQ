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

  const systemPrompt = `You are a world-class editorial AI, akin to a senior editor at The Atlantic, Wired, or Harvard Business Review. Your goal is to produce deep, authoritative, and brilliantly structured articles that captivate readers and rank highly on search engines.
    - Write in rich, semantic Markdown.
    - DO NOT include YAML frontmatter.
    - DO NOT use generic AI tropes (e.g., "In today's fast-paced world").
    - Prioritize unique insights, data-driven arguments, and compelling storytelling.`;

  const prompt = `Write a premium-quality, long-form feature article.

Topic: ${topic}
${audience ? `Target Audience: High-level stakeholders, ${audience}
` : ''}${tone ? `Tone: ${tone} (Sophisticated, Authoritative, yet Accessible)
` : ''}${callToAction ? `Strategic Goal: ${callToAction}
` : ''}${keywords && keywords.length ? `SEO Keywords: ${keywords.join(', ')}
` : ''}

STRUCTURE & QUALITY REQUIREMENTS:
1. **Title**: Create a compelling, click-worthy (but not clickbait) H1 title.
2. **Executive Summary**: A TL;DR block at the start (use blockquote >).
3. **Introduction**: Start with a story, a startling statistic, or a contrarian take. NO fluff.
4. **Body**:
   - Use H2 for major sections and H3 for subsections.
   - Include specific real-world examples, metaphors, and analogies.
   - Use short, punchy paragraphs mixed with deeper analysis.
   - **Crucial**: Include a "Key Takeaway" box at the end of each major section (use bold or italics).
5. **Conclusion**: Don't just summarize. Provide a forward-looking perspective or a call to innovation.
6. **FAQ**: 5 high-value questions that answer specific user intent (Schema-ready).

Ensure the content is AdSense compliant: High value, original, and safe.
Return ONLY raw markdown.`;

  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
  });
  const content = resp.choices[0]?.message?.content || '# Draft\nComing soon.';
  return content;
}

export interface FieldSuggestions {
  audience: string;
  tone: string;
  callToAction: string;
  keywords: string[];
  tags: string[];
  seoTitle: string;
  seoDescription: string;
}

export async function suggestBlogFields(input: { topic: string; title?: string }) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const t = input.topic || input.title || '';
  const prompt = `Based on the topic, suggest concise values for blog metadata.
Topic: ${t}
Return strict JSON:
{
  "audience": "",
  "tone": "",
  "callToAction": "",
  "keywords": ["", ""],
  "tags": ["", ""],
  "seoTitle": "",
  "seoDescription": ""
}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  });
  const content = resp.choices[0]?.message?.content || '{}';
  const parsed = JSON.parse(content);
  return parsed as FieldSuggestions;
}

export async function improveBlogMarkdown(params: {
  markdown: string;
  topic?: string;
  audience?: string;
  tone?: string;
  keywords?: string[];
}) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const system = `You improve blog markdown to be long-form, original, and AdSense compliant. Keep existing media/links intact. Output raw markdown only.`;
  const context = `Topic: ${params.topic || ''}\n${params.audience ? `Audience: ${params.audience}\n` : ''}${params.tone ? `Tone: ${params.tone}\n` : ''}${params.keywords && params.keywords.length ? `Keywords: ${params.keywords.join(', ')}\n` : ''}`;
  const user = `Improve the following markdown. Preserve all images, PDFs, links, headings. Increase depth, add executive summary, FAQs, and better structure when appropriate.\n\n${params.markdown}`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: context },
      { role: 'user', content: user },
    ],
    temperature: 0.5,
  });
  const content = resp.choices[0]?.message?.content || params.markdown;
  return content;
}

export async function describeMediaForBlog(params: {
  topic?: string;
  media: Array<{ type: 'image' | 'pdf'; url: string; name?: string }>;
}) {
  if (!openai) throw new Error('OPENAI_API_KEY not configured');
  const items = params.media.map(m => `${m.type.toUpperCase()}: ${m.name || ''} ${m.url}`).join('\n');
  const prompt = `Write markdown paragraphs that reference and explain these media items in a blog context. Keep URLs as given and do not remove or alter them. Make the text informative and high quality for AdSense compliance.
${params.topic ? `Topic: ${params.topic}\n` : ''}
Media:
${items}

Return raw markdown only.`;
  const resp = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
  });
  const content = resp.choices[0]?.message?.content || '';
  return content;
}
