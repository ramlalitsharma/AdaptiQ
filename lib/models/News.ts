export type NewsStatus = 'draft' | 'published';

export type NewsCategory = 'World' | 'Politics' | 'Technology' | 'Finance' | 'Environment' | 'Culture' | 'Health' | 'Opinion' | 'Local';

export type NewsCountry = 'Global' | 'Nepal' | 'India' | 'USA' | 'UK' | 'Canada' | 'Australia' | 'Germany' | 'France' | 'Japan';

export interface News {
    id: string; // UUID from Supabase
    title: string;
    slug: string;
    content: string; // HTML/JSON from Editor
    summary: string;
    category: NewsCategory | string;
    country: NewsCountry | string;
    cover_image?: string;
    tags?: string[];
    status: NewsStatus;
    author_id: string;
    view_count: number;
    is_trending: boolean;
    created_at: string;
    updated_at: string;
    published_at?: string;
}
