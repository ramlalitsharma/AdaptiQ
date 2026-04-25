import { getDatabase } from './mongodb';
import { AdvancedScraperService } from './news-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BRAND_NAME, BRAND_URL } from './brand';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export interface BlogDraft {
  title: string;
  slug: string;
  content: string;
  summary: string;
  category: string;
  tags: string[];
  coverImage?: string;
  author: string;
}

/**
 * PHASE 70: THE BLOG ARCHITECT (Agentic Content Production)
 * An autonomous agentic system that researches, plans, and writes long-form authoritative blogs.
 */
export const BlogAutomationService = {
  
  /**
   * PHASE 72: OMNI-SCOUT RESEARCH
   * Implements a resilient failover search across multiple providers.
   */
  async gatherMultiResourceResearch(topic: string): Promise<string> {
    console.log(`[Omni-Scout] Searching for: "${topic}"...`);
    let collectiveIntelligence = '';

    // PROVIDER A: Tavily (Deep Technical AI Research)
    try {
      if (process.env.TAVILY_API_KEY) {
        console.log('[Omni-Scout] Querying Provider A (Tavily)...');
        const response = await fetch('https://api.tavily.com/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.TAVILY_API_KEY,
            query: topic,
            search_depth: 'advanced',
            include_answer: true,
            max_results: 5
          })
        });
        const data = await response.json();
        if (data.results) {
          collectiveIntelligence += `[TAVILY INTELLIGENCE]:\n${data.answer || ''}\n` + 
            data.results.map((r: any) => `- ${r.title}: ${r.content}`).join('\n');
        }
      }
    } catch (e) {
      console.warn('[Omni-Scout] Provider A Failed. Falling back...');
    }

    // PROVIDER B: Google News RSS (Real-time Trends)
    if (!collectiveIntelligence || collectiveIntelligence.length < 500) {
      try {
        console.log('[Omni-Scout] Querying Provider B (Google News RSS)...');
        const news = await AdvancedScraperService.scrapeTargetedNews(topic);
        collectiveIntelligence += `\n\n[NEWS FEED DATA]:\n${news}`;
      } catch (e) {
        console.warn('[Omni-Scout] Provider B Failed.');
      }
    }

    // PROVIDER C: Deep Web Scrape Fallback
    if (!collectiveIntelligence) {
        throw new Error('Omni-Scout: All research providers failed. Cycle aborted to maintain quality.');
    }

    return collectiveIntelligence;
  },

  async generateAutonomousBlog(seedTopic?: string) {
    console.log('[Blog Architect] Initializing autonomous content cycle...');
    
    try {
      // 1. DISCOVERY
      const topic = seedTopic || await this.discoverTrendingTopic();
      
      // 2. RESEARCH (Now using Omni-Scout Failover)
      const researchContext = await this.gatherMultiResourceResearch(topic);
      
      // 3. STRATEGY
      const blueprint = await this.createMasterBlueprint(topic, researchContext);
      console.log('[Blog Architect] Strategy locked. Master Blueprint generated.');

      // 4. PRODUCTION: Section-by-Section Deep Writing
      const fullContent = await this.produceLongFormContent(topic, blueprint, researchContext);
      console.log('[Blog Architect] Production complete. 2000+ words of high-signal content generated.');

      // 5. PACKAGING: SEO, Meta, and Imaging
    const blogDraft = await this.packageBlog(topic, fullContent, blueprint);

    // 6. PUBLICATION: Commit to Database
    const publishedBlog = await this.publishToDatabase(blogDraft);
    
    return publishedBlog;
    } catch (error) {
      console.error('[Blog Architect] Execution failed:', error);
      throw error;
    }
  },

  async discoverTrendingTopic(): Promise<string> {
    const trends = await AdvancedScraperService.scrapeTrends();
    if (trends.length > 0) {
      // Pick the highest scoring trend that fits our technology/AI focus
      const techTrend = trends.find(t => t.category === 'Technology' || t.category === 'Science') || trends[0];
      return techTrend.title;
    }
    return 'The Future of AI-Orchestrated Learning Ecosystems';
  },

  async createMasterBlueprint(topic: string, context: string) {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const prompt = `
      As the Lead Content Strategist for ${BRAND_NAME}, create a Master Blueprint for a deep-dive technical blog post.
      TOPIC: ${topic}
      RESEARCH DATA: ${context.slice(0, 5000)}

      INSTRUCTIONS:
      1. Create a detailed 5-7 section outline.
      2. Each section must have a specific "High-Signal" goal.
      3. Include a "Refectl Insight" for each section (a unique, futuristic perspective).
      4. Ensure the flow is logical: Discovery -> Analysis -> Implementation -> Future Impact.

      RETURN ONLY A JSON OBJECT:
      {
        "title": "A powerful, catchy headline",
        "sections": [
          { "title": "Section Title", "goal": "What to explain", "insight": "The unique Refectl take" }
        ],
        "keywords": ["keyword1", "keyword2"]
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text.replace(/```json|```/g, ''));
  },

  async produceLongFormContent(topic: string, blueprint: any, context: string) {
    let fullContent = '';
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    for (const section of blueprint.sections) {
      console.log(`[Blog Architect] Writing Section: ${section.title}...`);
      
      const prompt = `
        As a world-class technology journalist at ${BRAND_NAME}, write the following section for a deep-dive report on ${topic}.
        
        SECTION TITLE: ${section.title}
        GOAL: ${section.goal}
        REFECTL INSIGHT TO INCLUDE: ${section.insight}
        RESEARCH CONTEXT: ${context.slice(0, 4000)}

        STYLE GUIDELINES:
        - TONE: Authoritative, futuristic, elite, and slightly academic.
        - FORMAT: Use Markdown. Use bolding for emphasis. Use a table or code block if relevant to the goal.
        - LENGTH: 300-500 words for this section alone.
        - NO FLUFF: Start with a strong hook. Avoid "In this section we will..."
        
        CURRENT CONTENT SO FAR (to ensure flow):
        ${fullContent.slice(-500)}

        Write only the section content. No headers needed.
      `;

      const result = await model.generateContent(prompt);
      fullContent += `\n\n## ${section.title}\n\n` + result.response.text();
    }

    return fullContent;
  },

  async packageBlog(topic: string, content: string, blueprint: any): Promise<BlogDraft> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Create SEO metadata for this blog post.
      TITLE: ${blueprint.title}
      CONTENT_PREVIEW: ${content.slice(0, 1000)}

      RETURN JSON:
      {
        "summary": "150 character meta description",
        "tags": ["tag1", "tag2"],
        "slug": "url-friendly-slug"
      }
    `;

    const result = await model.generateContent(prompt);
    const meta = JSON.parse(result.response.text().replace(/```json|```/g, ''));

    return {
      title: blueprint.title,
      slug: meta.slug,
      content: content,
      summary: meta.summary,
      category: 'Technology',
      tags: meta.tags,
      coverImage: `https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80`, // Generic AI high-end image
      author: 'Refectl Intelligence Bureau'
    };
  },

  async publishToDatabase(draft: BlogDraft) {
    const db = await getDatabase();
    const result = await db.collection('blogs').insertOne({
      ...draft,
      markdown: draft.content, // Sync for frontend compatibility
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
      views: 0,
      readTime: Math.ceil(draft.content.split(' ').length / 225)
    });
    
    return { id: result.insertedId, slug: draft.slug };
  }
};
