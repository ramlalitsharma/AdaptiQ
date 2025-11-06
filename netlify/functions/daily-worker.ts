import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    const secret = process.env.CRON_SECRET || '';
    if (!appUrl || !secret) return { statusCode: 200, body: 'Missing app url or secret' };

    const headers = { 'x-cron-secret': secret } as any;
    const [q, b] = await Promise.all([
      fetch(`${appUrl}/api/cron/generate-exam-question`, { method: 'POST', headers }),
      fetch(`${appUrl}/api/cron/generate-blog`, { method: 'POST', headers }),
    ]);
    return { statusCode: 200, body: `Question: ${q.status}, Blog: ${b.status}` };
  } catch (e: any) {
    return { statusCode: 500, body: e.message };
  }
};


