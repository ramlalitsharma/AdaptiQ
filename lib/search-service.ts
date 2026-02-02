import { MeiliSearch } from 'meilisearch';
import { getDatabase } from './mongodb';
import { logger } from './logger';

const MEILI_HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700';
const MEILI_KEY = process.env.MEILISEARCH_ADMIN_KEY || '';

const client = MEILI_KEY ? new MeiliSearch({
    host: MEILI_HOST,
    apiKey: MEILI_KEY,
}) : null;

export interface SearchResult {
    id: string;
    type: 'course' | 'blog' | 'exam' | 'subject';
    title: string;
    description: string;
    url: string;
    metadata?: Record<string, unknown>;
}

/**
 * Unified search for all platform entities
 */
export async function unifiedSearch(query: string, options?: {
    limit?: number;
    offset?: number;
    type?: string;
}): Promise<SearchResult[]> {
    const limit = options?.limit || 20;
    const offset = options?.offset || 0;
    const typeFilter = options?.type;

    if (!query) return [];

    try {
        // Priority 1: Meilisearch (High-performance full-text)
        if (client) {
            const searchResults = await client.index('combined_index').search(query, {
                limit,
                offset,
                filter: typeFilter ? `type = ${typeFilter}` : undefined,
            });

            return searchResults.hits as unknown as SearchResult[];
        }

        // Priority 2: MongoDB Text Search Fallback
        const db = await getDatabase();

        // Search across collections
        const [courses, blogs, exams] = await Promise.all([
            db.collection('courses').find({
                status: 'published',
                $text: { $search: query }
            }).limit(limit).toArray(),
            db.collection('blogs').find({
                status: 'published',
                $text: { $search: query }
            }).limit(limit).toArray(),
            db.collection('examTemplates').find({
                $text: { $search: query }
            }).limit(limit).toArray(),
        ]);

        const results: SearchResult[] = [
            ...courses.map(c => ({
                id: String(c._id),
                type: 'course' as const,
                title: c.title,
                description: c.summary || '',
                url: `/courses/${c.slug}`,
                metadata: { level: c.level, subject: c.subject }
            })),
            ...blogs.map(b => ({
                id: String(b._id),
                type: 'blog' as const,
                title: b.title,
                description: b.excerpt || '',
                url: `/blog/${b.slug}`,
                metadata: { tags: b.tags }
            })),
            ...exams.map(e => ({
                id: String(e._id),
                type: 'exam' as const,
                title: e.name,
                description: e.description || '',
                url: `/exams/${e.id}`,
                metadata: { category: e.category }
            }))
        ];

        // Simple relevance filtering (basic substring match if no text index exists)
        // In production, MongoDB $text requires properly configured indexes.

        return results
            .filter(r => !typeFilter || r.type === typeFilter)
            .slice(offset, offset + limit);

    } catch (error) {
        logger.error('Unified search error', error);
        return [];
    }
}

/**
 * Sync an entity to the search index
 */
export async function syncToSearch(entity: SearchResult) {
    if (!client) return;
    try {
        await client.index('combined_index').addDocuments([entity]);
    } catch (error) {
        logger.error('Failed to sync entity to search', error);
    }
}
