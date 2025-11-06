import { Handler } from '@netlify/functions';
import { openai } from '../../lib/openai';

export const handler: Handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    const body = JSON.parse(event.body || '{}');
    const { topic, difficulty, previousPerformance } = body;

    if (!topic) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Topic is required' }),
      };
    }

    const question = await generateAdaptiveQuestion(
      topic,
      difficulty || 'medium',
      previousPerformance
    );

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(question),
    };
  } catch (error: any) {
    console.error('Error generating quiz:', error);
    
    return {
      statusCode: 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to generate quiz',
        message: error.message,
      }),
    };
  }
};

// Import the function (for serverless environment)
async function generateAdaptiveQuestion(
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard',
  previousPerformance?: any
) {
  const { generateAdaptiveQuestion } = await import('../../lib/openai');
  return generateAdaptiveQuestion(topic, difficulty, previousPerformance);
}
