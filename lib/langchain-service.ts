import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Configuration for model providers
export type AIProvider = 'openai' | 'google' | 'groq' | 'mistral' | 'huggingface' | 'mock';

export interface LangChainConfig {
    provider: AIProvider;
    modelName: string;
    temperature?: number;
}

export const LangChainService = {
    /**
     * Initialize a model based on the provider with a high-fidelity swarm strategy
     */
    async getModel(config: LangChainConfig = { provider: 'google', modelName: 'gemini-1.5-flash' }) {
        // 1. Google Gemini (Primary Free High-Fidelity)
        if (config.provider === 'google' || (!process.env.OPENAI_API_KEY && process.env.GOOGLE_AI_API_KEY)) {
            return new ChatGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_AI_API_KEY,
                modelName: config.modelName || 'gemini-1.5-flash',
                temperature: config.temperature ?? 0.7,
            });
        }

        // 2. Groq (High Speed - Llama 3 / Mixtral)
        if (config.provider === 'groq' && process.env.GROQ_API_KEY) {
            return new ChatOpenAI({
                apiKey: process.env.GROQ_API_KEY,
                configuration: { baseURL: "https://api.groq.com/openai/v1" },
                modelName: config.modelName || 'llama-3.1-70b-versatile',
                temperature: config.temperature ?? 0.7,
            });
        }

        // 3. Mistral AI (Specialized Analysis)
        if (config.provider === 'mistral' && process.env.MISTRAL_API_KEY) {
            return new ChatOpenAI({
                apiKey: process.env.MISTRAL_API_KEY,
                configuration: { baseURL: "https://api.mistral.ai/v1" },
                modelName: config.modelName || 'mistral-large-latest',
                temperature: config.temperature ?? 0.7,
            });
        }

        // 4. OpenAI (Premium Fallback)
        if (config.provider === 'openai' || process.env.OPENAI_API_KEY) {
            return new ChatOpenAI({
                openAIApiKey: process.env.OPENAI_API_KEY,
                modelName: config.modelName || 'gpt-4o-mini',
                temperature: config.temperature ?? 0.7,
            });
        }

        // 5. Ultimate Fallback to Gemini if anything else fails but key exists
        if (process.env.GOOGLE_AI_API_KEY) {
            return new ChatGoogleGenerativeAI({
                apiKey: process.env.GOOGLE_AI_API_KEY,
                modelName: 'gemini-1.5-flash',
                temperature: config.temperature ?? 0.7,
            });
        }

        throw new Error("AI provider configuration missing. Please check your .env keys.");
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
        const model = await this.getModel({ 
            provider: config?.provider || 'openai',
            modelName: config?.modelName || 'gpt-4o',
            ...config, 
            temperature: 0 
        });

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
