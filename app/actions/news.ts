'use server';

import { NewsService } from '@/lib/news-service';
import { requireContentWriter } from '@/lib/admin-check';
import { revalidatePath } from 'next/cache';
import { redirect } from '@/lib/navigation';

export async function createNews(formData: FormData) {
    await requireContentWriter();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const summary = formData.get('summary') as string;
    const cover_image = formData.get('cover_image') as string;
    const status = formData.get('status') as 'draft' | 'published';
    const category = formData.get('category') as string;
    const country = formData.get('country') as string;
    const is_trending = formData.get('is_trending') === 'true';
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];

    // Generate slug from title if not provided
    let slug = formData.get('slug') as string;
    if (!slug) {
        slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    try {
        const { auth } = await import('@clerk/nextjs/server');
        const { userId } = await auth();

        const saved = await NewsService.upsertNews({
            title,
            slug,
            content,
            summary,
            cover_image,
            status,
            category,
            country,
            is_trending,
            tags,
            author_id: userId || 'system',
        });
    } catch (e) {
        console.error(e);
        return { error: 'Failed to create news' };
    }

    revalidatePath('/admin/studio/news');
    revalidatePath('/news');
    return { ok: true, slug };
}

export async function updateNews(id: string, formData: FormData) {
    await requireContentWriter();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const summary = formData.get('summary') as string;
    const cover_image = formData.get('cover_image') as string;
    const status = formData.get('status') as 'draft' | 'published';
    const category = formData.get('category') as string;
    const country = formData.get('country') as string;
    const is_trending = formData.get('is_trending') === 'true';
    const tags = (formData.get('tags') as string)?.split(',').map(t => t.trim()).filter(Boolean) || [];
    const slug = formData.get('slug') as string;

    try {
        const saved = await NewsService.upsertNews({
            id,
            title,
            slug,
            content,
            summary,
            cover_image,
            status,
            category,
            country,
            is_trending,
            tags
        });
    } catch (e) {
        console.error(e);
        return { error: 'Failed to update news' };
    }

    revalidatePath('/admin/studio/news');
    revalidatePath('/news');
    return { ok: true, slug };
}

export async function deleteNews(id: string) {
    await requireContentWriter();
    try {
        await NewsService.deleteNews(id);
        revalidatePath('/admin/studio/news');
    } catch (e) {
        return { error: 'Failed to delete news' };
    }
}
