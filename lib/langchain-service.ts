import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Configuration for model providers
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'mock';

export interface LangChainConfig {
    provider: AIProvider;
    modelName: string;
    temperature?: number;
}

export const LangChainService = {
    /**
     * Initialize a model based on the provider
     */
    async getModel(config: LangChainConfig = { provider: 'openai', modelName: 'gpt-4o' }) {
        if (config.provider === 'openai') {
            return new ChatOpenAI({
                openAIApiKey: process.env.OPENAI_API_KEY,
                modelName: config.modelName,
                temperature: config.temperature ?? 0.7,
            });
        }

        // Placeholder for other providers (Anthropic, Google)
        // In a real scenario, we'd install @langchain/anthropic etc.
        // For now, we fallback to OpenAI or throw if not configured
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("AI provider configuration missing. Please set OPENAI_API_KEY.");
        }

        return new ChatOpenAI({
            openAIApiKey: process.env.OPENAI_API_KEY,
            modelName: 'gpt-3.5-turbo', // Safe fallback
        });
    },

    /**
     * Generic completion helper
     */
    async generateCompletion(prompt: string, config?: LangChainConfig): Promise<string> {
        const model = await this.getModel(config);
        const response = await model.invoke(prompt);
        return response.content as string;
    },

    /**
     * Structured JSON output helper using LangChain
     */
    async generateStructuredJSON(systemPrompt: string, userPrompt: string, config?: LangChainConfig): Promise<any> {
        const model = await this.getModel({ ...config, temperature: 0 }); // Usually 0 for structured data

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", systemPrompt],
            ["user", "{input}"],
        ]);

        const chain = prompt.pipe(model).pipe(new StringOutputParser());

        const result = await chain.invoke({
            input: userPrompt,
        });

        try {
            // Find JSON block in case AI wraps it in markdown code blocks
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            const jsonString = jsonMatch ? jsonMatch[0] : result;
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Failed to parse AI JSON:", result);
            throw new Error("AI generated invalid JSON structure.");
        }
    }
};
