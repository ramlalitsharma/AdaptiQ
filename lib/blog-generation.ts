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

  const systemPrompt = `You are an expert professional blog writer. Your task is to write high-quality, comprehensive, and engaging blog articles that are AdSense compliant (long-form, original, valuable content).
    - Write in pure Markdown format.
    - DO NOT include YAML frontmatter (--- title: ... ---).
    - DO NOT wrap the output in markdown code blocks like \`\`\`markdown.
    - The output should be the raw markdown content only.`;

  const prompt = `Write a comprehensive, professional, and high-authority blog article optimized for search engines (SEO) and AdSense compliance.

Topic: ${topic}
${audience ? `Target Audience: ${audience}
` : ''}${tone ? `Tone: ${tone} (Authoritative, Insightful, and Engaging)
` : ''}${callToAction ? `Call to Action: ${callToAction}
` : ''}${keywords && keywords.length ? `Keywords: ${keywords.join(', ')}
` : ''}

STRUCTURE & REQUIREMENTS:
1. Length: Minimum 2,000 words. Provide deeply researched, original content.
2. EEAT Principles: Demonstrate Expertise, Experience, Authoritativeness, and Trustworthiness.
3. Content Outline:
   - # [Main Title]
   - **Table of Contents** (Quick navigation)
   - **Executive Summary/Key Takeaways** (Highlights for the reader)
   - ## Introduction (Include a hook and context)
   - ## [Major Section 1: Foundations/Definitions]
   - ## [Major Section 2: In-Depth Analysis & Strategies]
   - ## Case Studies / Real-World Applications
   - ## Future Trends and expert Insights
   - ## Conclusion & Next Steps
   - ## Frequently Asked Questions (H2, with 5 specific, high-value questions)
4. Formatting:
   - Use H1 (#) for title only.
   - Use H2 (##) for main chapters.
   - Use H3 (###) for detailed sub-topics.
   - Use bold text for emphasis and bullet points for lists.
   - Use short paragraphs (max 3 sentences) to ensure mobile-friendliness.
5. AdSense Compliance:
   - Focus on original value (no generic filler).
   - Maintain professional journalistic standards.
   - Ensure the content is helpful, reliable, and people-first.

IMPORTANT: Return ONLY the raw markdown content. Do NOT include frontmatter or code fences.`;

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
