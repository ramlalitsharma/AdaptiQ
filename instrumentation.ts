export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            console.log('✅ Next.js Instrumentation: Initialized (Telemetry quiet)');

            // ─── Self-Scheduling News Automation Engine ───────────────────────────
            // Fires every 30 minutes to auto-publish world news.
            // Works on local dev, Vercel, Netlify, Docker — any Node.js host.
            const AUTO_PUBLISH_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes
            const STARTUP_DELAY_MS = 15 * 1000; // 15s after server boot

            const runNewsAutomation = async () => {
                const enabled = process.env.NEWS_AUTO_PUBLISH_ENABLED !== 'false';
                if (!enabled) {
                    console.log('[AutoScheduler] NEWS_AUTO_PUBLISH_ENABLED=false — skipping.');
                    return;
                }
                try {
                    console.log('[AutoScheduler] 🔄 Starting autonomous news ingestion cycle...');
                    const { NewsAutomationService } = await import('./lib/news-automation');
                    const count = Number(process.env.NEWS_AUTO_PUBLISH_COUNT || '3');
                    const published = await NewsAutomationService.ingestRoamingGlobalNews(count);
                    console.log(`[AutoScheduler] ✅ Cycle complete — published ${published.length} articles.`);
                } catch (err: any) {
                    console.error('[AutoScheduler] ❌ Automation cycle failed:', err?.message || err);
                }
            };

            // Initial run after server warms up, then repeat every 30 minutes
            setTimeout(async () => {
                await runNewsAutomation();
                setInterval(runNewsAutomation, AUTO_PUBLISH_INTERVAL_MS);
            }, STARTUP_DELAY_MS);

            console.log('[AutoScheduler] 🚀 News engine armed — first cycle in 15s, then every 30 minutes.');
            // ─────────────────────────────────────────────────────────────────────

        } catch (error) {
            console.error('❌ Next.js Instrumentation Error:', error);
        }
    }
}
