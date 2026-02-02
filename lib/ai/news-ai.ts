import { openai } from '@/lib/openai';
import { DRAFT_PROMPT } from './prompts/draft';
import { CONTEXT_PROMPT } from './prompts/context';
import { STRATEGY_PROMPT } from './prompts/strategy';

export interface NewsDraftResult {
    print_headline: string;
    digital_headline: string;
    subheadline: string;
    executive_summary: string;
    body: string;
    suggested_tier: string;
}

export interface ContextBriefResult {
    background: string;
    key_players: string;
    whats_new: string;
    why_it_matters: string;
}

export interface EditorialStrategyResult {
    editorial_summary: string;
    operational_tags: string[];
    internal_linking: string[];
    headline_variants: {
        print: string;
        digital: string;
    };
    meta_description: string;
}

export const NewsAIService = {
    /**
     * Generates a high-level editorial draft from a topic.
     */
    generateNewsDraft: async (params: {
        topic: string;
        region: string;
        tone: 'Neutral' | 'Investigative' | 'Analytical';
        depth: 'Brief' | 'Standard' | 'Longform';
    }): Promise<NewsDraftResult> => {
        if (!openai) throw new Error('Intelligence System Offline: API Key Missing');

        const userPrompt = `
      Topic: ${params.topic}
      Region: ${params.region}
      Tone: ${params.tone}
      Depth: ${params.depth}
    `;

        const resp = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: DRAFT_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.5,
        });

        const content = resp.choices[0]?.message?.content || '{}';
        return JSON.parse(content) as NewsDraftResult;
    },

    /**
     * Generates a concise context brief for editors.
     */
    generateContextBrief: async (topic: string): Promise<ContextBriefResult> => {
        if (!openai) throw new Error('Intelligence System Offline: API Key Missing');

        const resp = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: CONTEXT_PROMPT },
                { role: 'user', content: `Topic: ${topic}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const content = resp.choices[0]?.message?.content || '{}';
        return JSON.parse(content) as ContextBriefResult;
    },

    /**
     * Analyzes content to generate editorial and SEO strategy.
     */
    generateEditorialStrategy: async (content: string, title?: string): Promise<EditorialStrategyResult> => {
        if (!openai) throw new Error('Intelligence System Offline: API Key Missing');

        const userPrompt = `
      Current Title: ${title || 'Unspecified'}
      Manuscript:
      ${content.substring(0, 4000)}
    `;

        const resp = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: STRATEGY_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.4,
        });

        const contentResp = resp.choices[0]?.message?.content || '{}';
        return JSON.parse(contentResp) as EditorialStrategyResult;
    }
};
