'use server';

import { NewsAIService, NewsDraftResult, ContextBriefResult, EditorialStrategyResult } from '@/lib/ai/news-ai';
import { requireContentWriter } from '@/lib/admin-check';

/**
 * Action to synthesize a news draft.
 */
export async function getNewsDraftAction(params: {
    topic: string;
    region: string;
    tone: 'Neutral' | 'Investigative' | 'Analytical';
    depth: 'Brief' | 'Standard' | 'Longform';
}): Promise<{ data?: NewsDraftResult; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAIService.generateNewsDraft(params);
        return { data };
    } catch (error: any) {
        console.error('AI Draft Error:', error);
        return { error: error.message || 'Intelligence Synthesis Failed' };
    }
}

/**
 * Action to generate a context brief memo.
 */
export async function getContextBriefAction(topic: string): Promise<{ data?: ContextBriefResult; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAIService.generateContextBrief(topic);
        return { data };
    } catch (error: any) {
        console.error('AI Context Error:', error);
        return { error: error.message || 'Briefing Generation Failed' };
    }
}

/**
 * Action to generate editorial strategy and SEO logic.
 */
export async function getEditorialStrategyAction(content: string, title?: string): Promise<{ data?: EditorialStrategyResult; error?: string }> {
    try {
        await requireContentWriter();
        const data = await NewsAIService.generateEditorialStrategy(content, title);
        return { data };
    } catch (error: any) {
        console.error('AI Strategy Error:', error);
        return { error: error.message || 'Strategy Analysis Failed' };
    }
}
