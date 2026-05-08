import { config } from 'dotenv';
config({ path: '.env.local' });
import { ChatOpenAI } from '@langchain/openai';

async function testKeys() {
  console.log('--- Key Verification ---');
  
  if (process.env.NVIDIA_API_KEY) {
    console.log('Testing NVIDIA...');
    try {
      const model = new ChatOpenAI({
        apiKey: process.env.NVIDIA_API_KEY,
        configuration: { baseURL: 'https://integrate.api.nvidia.com/v1' },
        modelName: 'meta/llama3-70b-instruct',
        maxRetries: 0,
      });
      const res = await model.invoke('Hi');
      console.log('✅ NVIDIA Success:', res.content);
    } catch (e: any) {
      console.error('❌ NVIDIA Failed:', e.message);
    }
  }

  if (process.env.OPENROUTER_API_KEY) {
    console.log('Testing OpenRouter...');
    try {
      const model = new ChatOpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        configuration: { baseURL: 'https://openrouter.ai/api/v1' },
        modelName: 'meta-llama/llama-3-8b-instruct:free',
        maxRetries: 0,
      });
      const res = await model.invoke('Hi');
      console.log('✅ OpenRouter Success:', res.content);
    } catch (e: any) {
      console.error('❌ OpenRouter Failed:', e.message);
    }
  }

  if (process.env.OPENAI_API_KEY) {
    console.log('Testing OpenAI...');
    try {
      const model = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4o-mini',
        maxRetries: 0,
      });
      const res = await model.invoke('Hi');
      console.log('✅ OpenAI Success:', res.content);
    } catch (e: any) {
      console.error('❌ OpenAI Failed:', e.message);
    }
  }
}

testKeys();
