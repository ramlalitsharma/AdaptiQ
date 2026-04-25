import { openai } from '@/lib/openai';
import { DRAFT_PROMPT } from './prompts/draft';
import { CONTEXT_PROMPT } from './prompts/context';
import { STRATEGY_PROMPT } from './prompts/strategy';
import { MultiAgentOrchestrator } from './ai-orchestrator';

import { uploadImageFromUrl } from '../supabase-storage';
import { AdvancedScraperService } from '../news-scraper';
import { translationService } from '../translation-service';

export interface NewsDraftResult {
    print_headline: string;
    digital_headline: string;
    subheadline: string;
    executive_summary: string;
    body: string;
    suggested_tier: string;
    cover_image?: string; // New: AI-generated or fallbacked
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
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    market_entities: string[];
    impact_score: number;
}

export const NewsAIService = {
    /**
     * Generates a high-level editorial draft from a topic.
     * Delegates to MultiAgentOrchestrator for zero-cost swarm intelligence.
     */
    generateNewsDraft: async (params: {
        topic: string;
        region: string;
        tone: 'Neutral' | 'Investigative' | 'Analytical';
        depth: 'Brief' | 'Standard' | 'Longform';
        sourceMaterial?: string;
    }): Promise<NewsDraftResult> => {
        try {
            console.log('[NewsAIService] Delegating Draft to Multi-Agent Swarm...');
            return await MultiAgentOrchestrator.runAuthorAgent({
                topic: params.topic,
                region: params.region,
                depth: params.depth,
                sourceMaterial: params.sourceMaterial
            });
        } catch (error) {
            console.warn('[NewsAIService] Swarm Draft failed. Using Sanitizer fallback.');
            return NewsAIService.generateDeterministicDraft(params);
        }
    },

    /**
     * Generates a concise context brief for editors.
     */
    generateContextBrief: async (topic: string): Promise<ContextBriefResult> => {
        try {
            console.log('[NewsAIService] Delegating Brief to Multi-Agent Swarm...');
            return await MultiAgentOrchestrator.runResearcherAgent(topic);
        } catch (error) {
            console.warn('[NewsAIService] Swarm Brief failed. Returning generic context.');
            return {
                background: `Global background assessment for ${topic}.`,
                key_players: "International actors and regional interests.",
                whats_new: "Real-time movements identified by intelligence network.",
                why_it_matters: "Significant impact on regional stability and global markets."
            };
        }
    },

    /**
     * Analyzes content to generate editorial and SEO strategy.
     */
    generateEditorialStrategy: async (content: string, title?: string): Promise<EditorialStrategyResult> => {
        try {
            console.log('[NewsAIService] Delegating Strategy to Multi-Agent Swarm...');
            return await MultiAgentOrchestrator.runEditorAgent(content, title || 'Unspecified Article');
        } catch (error) {
            console.warn('[NewsAIService] Swarm Strategy failed. Using Sanitizer fallback.');
            return NewsAIService.generateDeterministicStrategy(content, title || 'Unspecified', 'World');
        }
    },

    /**
     * Phase 27, 28, 29 & 34: Global Swarm Intelligence Switchboard
     * Orchestrates failover and now incorporates the Artist Agent for legal imagery.
     */
    generateNewsDraftHybrid: async (params: {
        topic: string;
        region: string;
        tone: 'Neutral' | 'Investigative' | 'Analytical';
        depth: 'Brief' | 'Standard' | 'Longform';
        sourceMaterial?: string;
        generateImage?: boolean; // New: Command to generate AI art
    }): Promise<{ draft: NewsDraftResult; strategy: EditorialStrategyResult; mode: 'Multi-Agent-Elite' | 'Multi-Agent' | 'AI' | 'Sanitized' }> => {

        // 1. Try The Global Swarm Intelligence Hub (Agentic Refinement Loop)
        try {
            console.log('[AI Switchboard] Level 1: Initializing Global Swarm Intelligence...');

            // Step A: Initial Draft (Author Agent)
            const initialDraft = await MultiAgentOrchestrator.runAuthorAgent({
                topic: params.topic,
                region: params.region,
                depth: params.depth,
                sourceMaterial: params.sourceMaterial
            });

            let finalDraft = initialDraft;
            let mode: any = 'Multi-Agent';

            try {
                console.log('[AI Switchboard] Level 1: Subjecting manuscript to elite peer-review...');
                const critique = await MultiAgentOrchestrator.runCriticAgent(initialDraft, params.sourceMaterial || 'N/A');

                if (critique.quality_score < 90 || critique.hallucinations.length > 0) {
                    console.log('[AI Switchboard] Level 1: Peer-review identified improvements. Polishing manuscript...');
                    finalDraft = await MultiAgentOrchestrator.runRefinerAgent(initialDraft, critique.feedback);
                    mode = 'Multi-Agent-Elite';
                }
            } catch (critiqueError) {
                console.warn('[AI Switchboard] Level 1 Critique/Refiner failed. Proceeding with initial draft.', critiqueError);
            }

            // Step D: Professional Metadata (Editor Agent)
            const strategy = await MultiAgentOrchestrator.runEditorAgent(finalDraft.body || 'Synthetic knowledge gathering in progress.', finalDraft.print_headline || params.topic);

            // Phase 34: Artist Agent (Legal Media)
            if (params.generateImage) {
                try {
                    console.log('[AI Switchboard] Phase 34: Activating Artist Agent for legal imagery...');
                    const tempImageUrl = await MultiAgentOrchestrator.runArtistAgent(finalDraft.print_headline || params.topic, finalDraft.executive_summary || 'Global Intelligence Summary');
                    if (tempImageUrl) {
                        const persistedUrl = await uploadImageFromUrl(tempImageUrl);
                        if (persistedUrl) finalDraft.cover_image = persistedUrl;
                    }
                } catch (artistError) {
                    console.warn('[AI Switchboard] Artist Agent failed. Falling back to default thumbnails.', artistError);
                }
            }

            return { draft: finalDraft, strategy, mode };

        } catch (multiAgentError) {
            console.warn('[AI Switchboard] Multi-Agent Path failed. Falling back to OpenAI.');
            try {
                const draft = await NewsAIService.generateNewsDraft(params);
                const strategy = await NewsAIService.generateEditorialStrategy(draft.body, draft.print_headline);

                if (params.generateImage) {
                    const tempImageUrl = await MultiAgentOrchestrator.runArtistAgent(draft.print_headline, draft.executive_summary);
                    if (tempImageUrl) {
                        const persistedUrl = await uploadImageFromUrl(tempImageUrl);
                        if (persistedUrl) draft.cover_image = persistedUrl;
                    }
                }

                return { draft, strategy, mode: 'AI' };
            } catch (openaiError: any) {
                console.warn('[AI Switchboard] OpenAI Path Failed. Activating Sanitizer Failover.', openaiError.message);
                const draft = NewsAIService.generateDeterministicDraft(params);
                const strategy = NewsAIService.generateDeterministicStrategy(draft.body, draft.print_headline, params.topic);
                return { draft, strategy, mode: 'Sanitized' };
            }
        }
    },

    /**
     * Phase 27: Deterministic Sanitizer (Zero-AI Cost)
     * Structurally formats scraped source material into a professional report without external API calls.
     */
    generateDeterministicDraft: (params: {
        topic: string;
        region: string;
        sourceMaterial?: string;
    }): NewsDraftResult => {
        const headline = (params.topic || 'Intelligence Update')
            .replace(/Latest insights regarding /i, '')
            .replace(/ news in /i, ': ')
            .replace(/Strategic Report:\s*/gi, '')
            .replace(/Global desk dispatch:\s*/gi, '')
            .replace(/Primary situational briefing:\s*/gi, '')
            .replace(/Recent developments and analysis:\s*/gi, '')
            .replace(/Verified updates consolidated:\s*/gi, '')
            .replace(/Intelligence relay established:\s*/gi, '')
            .trim();

        // Seeded hash for deterministic but varied variety
        const hash = headline.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        const summaryTemplates = [
            `Current reporting from ${params.region} indicates significant developments regarding ${headline}, as the situation continues to evolve with incoming data.`,
            `The regional desk in ${params.region} has highlighted ${headline} as a priority event, following a series of verified updates from local observers.`,
            `Strategic analysis from ${params.region} suggests a major shift in the climate surrounding ${headline}, with long-term implications for the sector.`,
            `As events in ${params.region} accelerate, the focus remains on ${headline}, bringing clearer perspective to the multifaceted nature of these recent reports.`
        ];

        const subheadlineTemplates = [
            `Analytical briefing from the ${params.region} desk.`,
            `Regional intelligence report: ${params.region}.`,
            `Developments and sectoral analysis from ${params.region}.`,
            `Verified briefing consolidated from regional intelligence streams.`
        ];

        const executive_summary = summaryTemplates[hash % summaryTemplates.length];
        const subheadline = subheadlineTemplates[hash % subheadlineTemplates.length];

        // Phase 27: Smart Neural Scrubber (Improved Parsing for [SOURCE:] format)
        let sanitizedBody = '<p>Developments currently unfolding.</p>';
        const raw = params.sourceMaterial || '';

        if (raw.includes('[SOURCE:')) {
            // Extract the core briefing blocks (split by \n\n---\n\n)
            const blocks = raw.split('\n\n---\n\n').map(b => b.trim()).filter(b => b.includes('[SOURCE:'));
            if (blocks.length > 0) {
                sanitizedBody = blocks.map((block) => {
                    // Modern format: [SOURCE: X] Title\nContext: Content\nIntelligence Snapshot: Y
                    const sourceMatch = block.match(/\[SOURCE:\s*(.*?)\]/);
                    const titleMatch = block.match(/\]\s*(.*)\nContext:/);
                    const contextMatch = block.match(/Context:\s*([\s\S]*?)(?:\nIntelligence Snapshot:|$)/);

                    const source = sourceMatch ? sourceMatch[1].trim() : 'Verified Wire';
                    const title = titleMatch ? titleMatch[1].trim() : 'Factual Vector';
                    const context = contextMatch ? contextMatch[1].trim() : '';

                    return `
                        <h3>${title}</h3>
                        <p><strong>Intelligence Source (via ${source}):</strong> ${AdvancedScraperService.scrubMetadata(context)}</p>
                    `.trim();
                }).join('\n');
            }
        } else if (raw.length > 100) {
            sanitizedBody = `<p>${AdvancedScraperService.scrubMetadata(raw.slice(0, 1500))}</p>`;
        }

        return {
            print_headline: headline,
            digital_headline: `Strategic Report: ${headline}`,
            subheadline,
            executive_summary,
            body: `${sanitizedBody}`.trim(),
            suggested_tier: 'Standard'
        };
    },

    /**
     * Phase 27: Deterministic Strategy Fallback
     */
    generateDeterministicStrategy: (content: string, title: string, topic: string): EditorialStrategyResult => {
        const categories = ['Finance', 'Tech', 'Politics', 'Business', 'World', 'Trade', 'Science', 'Health'];
        const detectedTag = categories.find(c => topic.toLowerCase().includes(c.toLowerCase()) || title.toLowerCase().includes(c.toLowerCase())) || 'World';

        // Keyword-based sentiment & impact prediction (Elite Heuristics)
        let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
        let impact = 55;

        const bullishKeywords = ['launch', 'growth', 'surge', 'deal', 'agreement', 'breakthrough', 'success', 'recovery'];
        const bearishKeywords = ['tensions', 'conflict', 'drop', 'slump', 'threat', 'warning', 'risk', 'crisis', 'earthquake'];
        const text = (title + ' ' + content).toLowerCase();

        if (bullishKeywords.some(k => text.includes(k))) {
            sentiment = 'Bullish';
            impact = 72;
        } else if (bearishKeywords.some(k => text.includes(k))) {
            sentiment = 'Bearish';
            impact = 78;
        }

        return {
            editorial_summary: `Automated assessment of strategic movements regarding ${title}. Analysis suggests a regional focus on ${detectedTag} with ${sentiment} signals.`,
            operational_tags: [detectedTag, 'Automated', 'Intelligence', 'Global'],
            internal_linking: [],
            headline_variants: { print: title, digital: `Intel: ${title}` },
            meta_description: `Latest strategic intelligence and verified movements regarding ${title}. Reporting via Terai Times Autonomous Desk.`,
            sentiment,
            market_entities: [],
            impact_score: impact
        };
    },

    /**
     * Phase 7: Multi-Language Intelligence Swarm
     * Translates core intelligence components into the target locale using the Swarm.
     */
    translateIntelligence: async (text: string, targetLocale: string): Promise<string> => {
        if (targetLocale === 'en') return text;
        return translationService.translate(text, targetLocale);
    }
};
