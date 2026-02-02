import { LangChainService } from '../lib/langchain-service';

/**
 * Script to verify LangChain configuration and multi-model switching
 */
async function verifyMultiModelAI() {
    console.log('🚀 Starting Multi-Model AI Verification...');

    try {
        // 1. Test GPT-4o (Default)
        console.log('--- Testing GPT-4o ---');
        const gpt4Response = await LangChainService.generateCompletion(
            "Briefly explain why LangChain is useful for educational platforms.",
            { provider: 'openai', modelName: 'gpt-4o' }
        );
        console.log('GPT-4o Response:', gpt4Response.substring(0, 100) + '...');

        // 2. Test GPT-4o-mini (Speed/Cost optimized)
        console.log('\n--- Testing GPT-4o-mini ---');
        const gptMiniResponse = await LangChainService.generateCompletion(
            "Write a one-sentence greeting for a student.",
            { provider: 'openai', modelName: 'gpt-4o-mini' }
        );
        console.log('GPT-4o-mini Response:', gptMiniResponse);

        // 3. Test Structured Output
        console.log('\n--- Testing Structured JSON Output ---');
        const systemPrompt = "You are a JSON assistant.";
        const userPrompt = "Generate a JSON with 'success': true and 'modelUsed': 'langchain-test'.";
        const jsonResult = await LangChainService.generateStructuredJSON(systemPrompt, userPrompt);
        console.log('JSON Result:', jsonResult);

        console.log('\n✅ Verification Complete: All models operational.');
    } catch (error: any) {
        console.error('\n❌ Verification Failed:', error.message);
    }
}

// Note: In an actual terminal, this would be run with `npx tsx scripts/verify-ai.ts`
// This is provided here as a reference for the user.
// verifyMultiModelAI();
