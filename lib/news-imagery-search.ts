import axios from 'axios';

/**
 * News Imagery Search Service (NISS)
 * Provides zero-cost, high-quality image discovery for global news.
 */
export const NewsImagerySearch = {
    /**
     * Searches for a high-quality stock photo on Unsplash (Public Search).
     * Returns the high-res URL or null if not found.
     */
    async findFreeStockPhoto(keywords: string[]): Promise<string | null> {
        // Sanitize the query: Remove extremely long strings and focus on the core entities.
        // If the keywords array has [Title, Category, Country], we extract the most powerful terms.
        const rawQuery = keywords.filter(Boolean).join(' ');
        
        // Remove common stop words and punctuation that break image searches
        const sanitizedTokens = rawQuery
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !['this', 'that', 'with', 'from', 'what', 'have'].includes(word.toLowerCase()))
            .slice(0, 4); // Only use the top 4 keywords for maximum broad discovery

        const query = sanitizedTokens.length > 0 ? sanitizedTokens.join(' ') : keywords[0]?.slice(0, 20) || 'World News';
        console.log(`[Imagery Search] Scanning Multiple Sources for: "${query}"`);

        try {
            // Source 1: Unsplash Commercial-Free Search
            const searchUrl = `https://unsplash.com/s/photos/${encodeURIComponent(query)}`;
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://unsplash.com/',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'max-age=0'
                },
                timeout: 8000
            });

            const html = response.data;
            const photoMatch = html.match(/https:\/\/images\.unsplash\.com\/photo-[^?"]+/);
            
            if (photoMatch) {
                const photoUrl = photoMatch[0];
                console.log(`[Imagery Search] Source 1 (Unsplash) Success: ${photoUrl}`);
                return `${photoUrl}?auto=format&fit=crop&w=1600&q=80`;
            }
        } catch (error: any) {
            console.warn(`[Imagery Search] Source 1 (Unsplash) Failed or Blocked. Attempting Source 2...`);
        }

        // Source 2: Wikimedia Commons Public Domain Search
        try {
            console.log(`[Imagery Search] Attempting Source 2 (Wikimedia) for: "${query}"`);
            const api = `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=pageimages&titles=${encodeURIComponent(query)}&pithumbsize=1024&origin=*`;
            const response = await axios.get(api, { timeout: 8000 });
            const pages = response.data?.query?.pages;
            if (pages) {
                const firstPageId = Object.keys(pages)[0];
                const thumb = pages[firstPageId]?.thumbnail?.source;
                if (thumb) {
                    console.log(`[Imagery Search] Source 2 (Wikimedia) Success!`);
                    return thumb;
                }
            }
        } catch (error) {
            console.warn(`[Imagery Search] Source 2 (Wikimedia) Failed.`);
        }

        return null;
    }
};
