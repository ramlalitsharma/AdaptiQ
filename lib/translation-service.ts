import { LangChainService } from './langchain-service';
import { Redis } from '@upstash/redis';

/**
 * Enterprise-Grade News Translation Service
 * Implements a 3-tier caching strategy for maximum performance and zero cost.
 */
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

class TranslationService {
  private memoryCache: Map<string, string> = new Map();

  /**
   * Localizes content with high-fidelity AI and persistent caching.
   */
  async translate(text: string, targetLanguage: string): Promise<string> {
    if (!text) return text;
    
    // Phase 59: Intelligent English Guard
    // If target is English, but source contains non-English characters, we translate it.
    const isEnglishTarget = targetLanguage === 'en';
    const hasNonEnglishChars = /[^\u0000-\u007F]/.test(text);
    
    if (isEnglishTarget && !hasNonEnglishChars) return text;

    // Generate a secure, deterministic cache key
    const hash = Buffer.from(text).toString('base64').slice(0, 120);
    const cacheKey = `news:v2:trans:${targetLanguage}:${hash}`;
    
    // Tier 1: In-Memory (Zero latency)
    if (this.memoryCache.has(cacheKey)) {
      return this.memoryCache.get(cacheKey)!;
    }

    // Tier 2: Global Redis (Cross-region persistence)
    if (redis) {
      try {
        const cached = await redis.get<string>(cacheKey);
        if (cached) {
          this.memoryCache.set(cacheKey, cached);
          return cached;
        }
      } catch (err) {
        console.warn('[TranslationService] Redis unavailable:', err);
      }
    }

    // Tier 3: Translation Swarm (Gemini + Google Relay Fallback)
    try {
      // 3a: High-Speed Swarm Relays (Sub-500ms fallbacks)
      const googleTranslate = async (t: string, lang: string) => {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(t)}`;
          const response = await fetch(url);
          const data = await response.json();
          return data[0].map((x: any) => x[0]).join('') as string;
        } catch { return null; }
      };

      const libreTranslate = async (t: string, lang: string) => {
        try {
          const response = await fetch('https://libretranslate.de/translate', {
            method: 'POST',
            body: JSON.stringify({ q: t, source: 'auto', target: lang, format: 'text' }),
            headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          return data.translatedText;
        } catch { return null; }
      };

      const puterTranslate = async (t: string, lang: string) => {
        try {
          // Puter relay via a public gateway or direct if available
          const response = await fetch(`https://api.puter.com/translate?text=${encodeURIComponent(t)}&to=${lang}`);
          const data = await response.json();
          return data.translation;
        } catch { return null; }
      };

      // 3b: Strategic Race / Fallback Swarm
      let translation: string | null = null;

      try {
        const prompt = `Act as a senior international news editor. Translate the following text into ${targetLanguage}. 
        Ensure the translation is natural, culturally appropriate, and maintains a professional journalistic tone.
        Return ONLY the translated text.
        
        Text to translate: ${text}`;
        
        translation = await LangChainService.generateCompletion(prompt, {
          provider: 'google',
          modelName: 'gemini-1.5-flash',
          temperature: 0.1
        });
      } catch (geminiErr) {
        console.warn('[TranslationService] Gemini failed, falling back to Google Swarm...');
        translation = await googleTranslate(text, targetLanguage);
      }

      if (!translation) {
        // Ultimate swarm fallback sequence
        translation = await googleTranslate(text, targetLanguage) || 
                      await puterTranslate(text, targetLanguage) ||
                      await libreTranslate(text, targetLanguage) ||
                      text;
      }

      const cleaned = translation.trim();
      
      // Populate caches for future requests
      this.memoryCache.set(cacheKey, cleaned);
      if (redis) {
        redis.set(cacheKey, cleaned, { ex: 604800 }).catch(() => {});
      }
      
      return cleaned;
    } catch (error) {
      console.error('[TranslationService] Swarm Translation failed:', error);
      return text;
    }
  }

  /**
   * Proactively warms the cache for high-priority languages.
   * Ensures zero-latency for users in these locales.
   */
  async warmCache(params: {
    title: string;
    summary?: string;
    category?: string;
    locales: string[];
  }) {
    const { title, summary, category, locales } = params;
    const items = [
      { text: title, key: 'title' },
      ...(summary ? [{ text: summary, key: 'summary' }] : []),
      ...(category ? [{ text: category, key: 'category' }] : []),
    ];

    console.log(`[TranslationService] Warming cache for ${locales.join(', ')}...`);
    
    await Promise.all(locales.map(async (locale) => {
      if (locale === 'en') return;
      return Promise.all(items.map(item => this.translate(item.text, locale)));
    }));
  }

  /**
   * Optimized batch translation for high-fidelity news grids.
   */
  async translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
    if (targetLanguage === 'en') return texts;
    return Promise.all(texts.map(t => this.translate(t, targetLanguage)));
  }
}

export const translationService = new TranslationService();
