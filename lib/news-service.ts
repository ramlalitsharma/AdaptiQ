import { supabase, supabaseAdmin } from './supabase';
import { News } from './models/News';

export const NewsService = {
    /**
     * Get all published news for public view with filtering
     */
    async getPublishedNews(filters?: { country?: string; category?: string }): Promise<News[]> {
        const client = supabaseAdmin || supabase;
        let query = client
            .from('news')
            .select('*')
            .or('status.eq.published,status.eq.Published,status.eq.live');

        if (filters?.country && filters.country !== 'All' && filters.country !== 'Global') {
            query = query.eq('country', filters.country);
        }

        if (filters?.category && filters.category !== 'All') {
            query = query.eq('category', filters.category);
        }

        const primary = await query.order('published_at', { ascending: false });
        if (primary.error) {
            throw primary.error;
        }
        let data = primary.data || [];
        if (!data.length) {
            const fallback = await client
                .from('news')
                .select('*')
                .not('published_at', 'is', null)
                .order('published_at', { ascending: false });
            if (!fallback.error) {
                data = fallback.data || [];
            }
        }
        return data;
    },

    /**
     * Get trending news
     */
    async getTrendingNews(limit: number = 5): Promise<News[]> {
        const client = supabaseAdmin || supabase;
        const res = await client
            .from('news')
            .select('*')
            .or('status.eq.published,status.eq.Published,status.eq.live')
            .order('view_count', { ascending: false })
            .limit(limit);
        if (res.error) {
            return [];
        }
        let data = res.data || [];
        if (!data.length) {
            const fallback = await client
                .from('news')
                .select('*')
                .not('published_at', 'is', null)
                .order('created_at', { ascending: false })
                .limit(limit);
            if (!fallback.error) {
                data = fallback.data || [];
            }
        }
        return data;
    },

    /**
     * Get recent news pulse
     */
    async getRecentNews(limit: number = 10): Promise<News[]> {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client
            .from('news')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data || [];
    },

    /**
     * Get all news for admin view
     */
    async getAllNews() {
        const client = supabaseAdmin || supabase;
        const { data, error } = await client
            .from('news')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) {
            return [];
        }
        return data || [];
    },

    /**
     * Get a single news item by slug
     */
    async getNewsBySlug(slug: string): Promise<News | null> {
        const client = supabaseAdmin || supabase;
        const res = await client
            .from('news')
            .select('*')
            .eq('slug', slug)
            .single();
        if (res.error && res.error.code !== 'PGRST116') {
            throw res.error;
        }
        if (res.data) return res.data;
        const alt = await client
            .from('news')
            .select('*')
            .eq('slug', slug)
            .or('status.eq.published,status.eq.Published,status.eq.live')
            .limit(1);
        if (!alt.error && (alt.data || []).length) {
            return alt.data![0] as any;
        }
        return null;
    },

    /**
     * Get a single news item by ID
     */
    async getNewsById(id: string): Promise<News | null> {
        if (!supabaseAdmin) throw new Error('Admin client not initialized');
        const { data, error } = await supabaseAdmin
            .from('news')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    /**
     * Create or update news
     */
    async upsertNews(news: Partial<News>) {
        if (!supabaseAdmin) throw new Error('Admin client not initialized');
        const { data, error } = await supabaseAdmin
            .from('news')
            .upsert({
                ...news,
                updated_at: new Date().toISOString(),
                published_at: news.status === 'published' ? new Date().toISOString() : null
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * Delete news article
     */
    async deleteNews(id: string) {
        if (!supabaseAdmin) throw new Error('Admin client not initialized');
        const { error } = await supabaseAdmin
            .from('news')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
