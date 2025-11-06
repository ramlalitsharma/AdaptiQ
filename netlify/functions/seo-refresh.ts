// Netlify Scheduled Function: posts trending keywords to the app daily
import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const keywordsCsv = process.env.SEO_TREND_KEYWORDS || '';
    if (!appUrl || !keywordsCsv) {
      return { statusCode: 200, body: 'No app URL or keywords configured. Skipping.' };
    }
    const keywords = keywordsCsv.split(',').map((k) => k.trim()).filter(Boolean);
    if (!keywords.length) {
      return { statusCode: 200, body: 'No keywords provided.' };
    }
    const res = await fetch(`${appUrl}/api/seo/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords }),
    });
    return { statusCode: 200, body: `Posted ${keywords.length} keywords. Response: ${res.status}` };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};


