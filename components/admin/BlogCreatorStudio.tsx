'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { MediaUploader } from '@/components/media/MediaUploader';
import Image from 'next/image';

interface BlogSummary {
  id: string;
  slug?: string;
  title: string;
  status: string;
  createdAt?: string;
}

interface BlogCreatorStudioProps {
  recentBlogs: BlogSummary[];
}

interface BlogResource {
  type: 'link' | 'image' | 'pdf' | 'video';
  label: string;
  url: string;
}

export function BlogCreatorStudio({ recentBlogs: initialBlogs }: BlogCreatorStudioProps) {
  const [recentBlogs, setRecentBlogs] = useState<BlogSummary[]>(initialBlogs);
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [assisting, setAssisting] = useState(false);
  const [improving, setImproving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    topic: '',
    audience: '',
    tone: 'In-depth yet accessible',
    callToAction: 'Invite readers to enroll in AdaptIQ',
    keywords: 'adaptive learning, ai quizzes',
    tags: 'education, adaptive learning',
    heroImage: '',
    seoTitle: '',
    seoDescription: '',
    markdown: '',
  });
  const [resources, setResources] = useState<BlogResource[]>([]);

  const canSubmit = useMemo(() => {
    if (mode === 'manual') {
      return Boolean(form.title.trim() && form.markdown.trim());
    }
    return Boolean((form.topic || form.title).trim());
  }, [form, mode]);

  const handleGeneratePreview = async () => {
    const topic = form.topic.trim() || form.title.trim();
    if (!topic) {
      setError('Provide a topic or title before generating.');
      return;
    }
    setError(null);
    setGeneratingPreview(true);
    try {
      const payload = {
        topic,
        audience: form.audience.trim() || undefined,
        tone: form.tone.trim() || undefined,
        callToAction: form.callToAction.trim() || undefined,
        keywords: form.keywords
          .split(',')
          .map((kw) => kw.trim())
          .filter(Boolean),
      };
      const res = await fetch('/api/admin/blogs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate blog preview');
      }
      setForm((prev) => ({ ...prev, markdown: data.markdown }));
    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { message?: string })?.message || 'Unable to generate preview';
      setError(msg);
    } finally {
      setGeneratingPreview(false);
    }
  };

  const insertContent = (text: string) => {
    setForm(prev => ({ ...prev, markdown: prev.markdown + '\n' + text }));
  };

  const handleAssistFields = async () => {
    const topic = form.topic.trim() || form.title.trim();
    if (!topic) {
      setError('Provide a topic or title before AI assist.');
      return;
    }
    setError(null);
    setAssisting(true);
    try {
      const res = await fetch('/api/admin/blogs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'suggest_fields', topic, title: form.title }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch suggestions');
      const s = data.suggestions || {};
      setForm(prev => ({
        ...prev,
        audience: s.audience || prev.audience,
        tone: s.tone || prev.tone,
        callToAction: s.callToAction || prev.callToAction,
        keywords: Array.isArray(s.keywords) ? s.keywords.join(', ') : (prev.keywords || ''),
        tags: Array.isArray(s.tags) ? s.tags.join(', ') : (prev.tags || ''),
        seoTitle: s.seoTitle || prev.seoTitle,
        seoDescription: s.seoDescription || prev.seoDescription,
      }));
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || 'Failed to fetch suggestions';
      setError(msg);
    } finally {
      setAssisting(false);
    }
  };

  const handleImproveContent = async () => {
    if (!form.markdown.trim()) return;
    setImproving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/blogs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve_markdown',
          markdown: form.markdown,
          topic: form.topic || form.title,
          audience: form.audience,
          tone: form.tone,
          keywords: form.keywords.split(',').map(x => x.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to improve content');
      setForm(prev => ({ ...prev, markdown: data.markdown || prev.markdown }));
    } catch (e: unknown) {
      const msg = (e as { message?: string })?.message || 'Failed to improve content';
      setError(msg);
    } finally {
      setImproving(false);
    }
  };

  const enhanceWithMedia = async (type: 'image' | 'pdf', url: string, name?: string) => {
    const topic = form.topic.trim() || form.title.trim();
    try {
      const res = await fetch('/api/admin/blogs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_media',
          topic,
          media: [{ type, url, name }],
        }),
      });
      const data = await res.json();
      if (res.ok && data.markdown) {
        insertContent('\n' + data.markdown + '\n');
      }
    } catch {}
  };

  const handleSubmit = async (saveAsStatus?: string) => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const base: Record<string, unknown> = {
        mode,
        title: form.title.trim() || undefined,
        topic: form.topic.trim() || undefined,
        audience: form.audience.trim() || undefined,
        tone: form.tone.trim() || undefined,
        callToAction: form.callToAction.trim() || undefined,
        keywords: form.keywords
          .split(',')
          .map((kw) => kw.trim())
          .filter(Boolean),
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        heroImage: form.heroImage.trim() || undefined,
        seo: {
          title: form.seoTitle.trim() || undefined,
          description: form.seoDescription.trim() || undefined,
        },
        resources: resources.filter((resource) => resource.label.trim() && resource.url.trim()),
        status: saveAsStatus
      };
      const isManual = mode === 'manual';
      const url = editingSlug ? `/api/admin/blogs/${editingSlug}` : '/api/admin/blogs';
      const method = editingSlug ? 'PUT' : 'POST';

      const payload = (() => {
        if (editingSlug) {
          const updateData: Record<string, unknown> = { ...base };
          // Remove mode for PUT
          delete updateData.mode;
          // Adapt content for PUT
          if (isManual) {
            updateData.content = form.markdown;
          }
          return updateData;
        } else {
          const createData: Record<string, unknown> = { ...base };
          if (isManual) {
            createData.markdown = form.markdown;
          }
          return createData;
        }
      })();

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save blog');
      }
      setResult(editingSlug ? { ...data, title: form.title, status: saveAsStatus || 'draft' } : (data.blog as Record<string, unknown>));

      // Update local list if editing or new
      if (editingSlug) {
        setRecentBlogs(prev => prev.map(b => b.slug === editingSlug ? { ...b, title: form.title, status: saveAsStatus || b.status } : b));
        setEditingSlug(null); // Exit edit mode
        resetForm();
      } else {
        // Add new to top (simplified)
        window.location.reload(); // Simplest way to refresh list
      }

    } catch (err: unknown) {
      console.error(err);
      const msg = (err as { message?: string })?.message || 'Unexpected error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      topic: '',
      audience: '',
      tone: 'In-depth yet accessible',
      callToAction: 'Invite readers to enroll in AdaptIQ',
      keywords: 'adaptive learning, ai quizzes',
      tags: 'education, adaptive learning',
      heroImage: '',
      seoTitle: '',
      seoDescription: '',
      markdown: '',
    });
    setResources([]);
    setEditingSlug(null);
    setMode('ai');
  }

  const handleEdit = async (blog: BlogSummary) => {
    if (!blog.slug) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/blogs/${blog.slug}`);
      if (!res.ok) throw new Error('Failed to fetch blog details');
      const data = await res.json();

      setEditingSlug(blog.slug);
      setMode('manual');
      setForm({
        title: data.title || '',
        topic: '', // Typically lost in transformation, but title is enough
        audience: '',
        tone: '',
        callToAction: '',
        keywords: '',
        tags: Array.isArray(data.tags) ? data.tags.join(', ') : '',
        heroImage: data.coverImage || '',
        seoTitle: '', // Typically not in main blob unless stored specifically
        seoDescription: data.excerpt || '',
        markdown: data.content || '',
      });
      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setError('Failed to fetch blog details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;
    try {
      const res = await fetch(`/api/admin/blogs/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setRecentBlogs(prev => prev.filter(b => b.slug !== slug));
    } catch {
      alert('Failed to delete blog');
    }
  };

  const handleToggleStatus = async (blog: BlogSummary) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`/api/admin/blogs/${blog.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      setRecentBlogs(prev => prev.map(b => b.slug === blog.slug ? { ...b, status: newStatus } : b));
    } catch {
      alert('Failed to update status');
    }
  };

  const seoTitle = form.seoTitle || `${form.title || form.topic || 'Blog'} | AdaptIQ Blog`;
  const seoDescription = form.seoDescription || form.callToAction || 'AI-enhanced blog';

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">{editingSlug ? 'Editing Blog' : 'Blog Studio'}</h2>
            <p className="text-sm text-slate-500">Generate editorial pieces with AI, optimize for SEO, and ship marketing CTAs.</p>
          </div>
          <div className="flex gap-2 text-sm">
            {editingSlug ? (
              <Button variant="outline" size="sm" onClick={resetForm}>Cancel Edit</Button>
            ) : (
              <>
                <Button variant={mode === 'ai' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('ai')}>
                  AI Article
                </Button>
                <Button variant={mode === 'manual' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('manual')}>
                  Manual Markdown
                </Button>
              </>
            )}

          </div>
        </div>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Editorial metadata</h3>
            <div className="space-y-3">
              <label className="space-y-1 text-sm text-slate-600">
                Blog title
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Why Adaptive Learning Outperforms Static Curricula"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              {!editingSlug && (
                <>
                  <label className="space-y-1 text-sm text-slate-600">
                    AI topic focus
                    <input
                      value={form.topic}
                      onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
                      placeholder="Adaptive assessments for competitive exams"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                    <div className="mt-2">
                      <Button size="sm" variant="outline" onClick={handleAssistFields} disabled={assisting || !(form.topic.trim() || form.title.trim())}>
                        {assisting ? 'Thinking…' : 'AI Auto-fill metadata'}
                      </Button>
                    </div>
                  </label>
                  <label className="space-y-1 text-sm text-slate-600">
                    Target audience
                    <input
                      value={form.audience}
                      onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                      placeholder="Heads of L&D, high school students, etc."
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-600">
                    Tone
                    <input
                      value={form.tone}
                      onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                      placeholder="Thought leadership, conversational, data-driven"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-600">
                    Call to action
                    <input
                      value={form.callToAction}
                      onChange={(e) => setForm((prev) => ({ ...prev, callToAction: e.target.value }))}
                      placeholder="Invite readers to book a demo"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1 text-sm text-slate-600">
                    Keywords
                    <input
                      value={form.keywords}
                      onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
                      placeholder="adaptive learning, ai quiz, netlify"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                </>
              )}

              {mode === 'ai' && !editingSlug && (
                <div className="pt-2">
                  <Button
                    onClick={handleGeneratePreview}
                    disabled={generatingPreview || !form.topic.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all flex items-center justify-center gap-2 py-6"
                  >
                    {generatingPreview ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Generating High-Quality Draft...
                      </>
                    ) : (
                      <>
                        <span className="text-lg">✨</span>
                        Generate Professional AI Article
                      </>
                    )}
                  </Button>
                  <p className="mt-2 text-[10px] text-slate-500 text-center italic">
                    AI will generate a 2,000+ word, SEO-optimized, and AdSense-compliant professional draft.
                  </p>
                </div>
              )}

              <label className="space-y-1 text-sm text-slate-600">
                Tags
                <input
                  value={form.tags}
                  onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                  placeholder="education, adaptive learning"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>





              <label className="space-y-1 text-sm text-slate-600">
                Hero Image
                <div className="space-y-2">
                  <MediaUploader
                    accept="image/*"
                    variant="dropzone"
                    label="Upload Hero Image"
                    onUploadComplete={(url: string) => setForm(prev => ({ ...prev, heroImage: url }))}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">OR</span>
                    <input
                      value={form.heroImage}
                      onChange={(e) => setForm((prev) => ({ ...prev, heroImage: e.target.value }))}
                      placeholder="https://images..."
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>
              </label>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Content editor</h3>

            <div className="flex gap-2 items-center flex-wrap border-b border-slate-100 pb-2">
              <span className="text-xs font-semibold text-slate-500 mr-2">Insert:</span>
              <MediaUploader
                label="📷 Image"
                accept="image/*"
                onUploadComplete={async (url: string, name: string) => {
                  insertContent(`![${name}](${url})`);
                  await enhanceWithMedia('image', url, name);
                }}
              />
              <MediaUploader
                label="📄 PDF"
                accept="application/pdf"
                onUploadComplete={async (url: string, name: string) => {
                  insertContent(`\n[PDF: ${name}](${url})\n`);
                  await enhanceWithMedia('pdf', url, name);
                }}
              />
              <Button size="sm" variant="outline" onClick={handleImproveContent} disabled={improving || !form.markdown.trim()}>
                {improving ? 'Improving…' : 'Improve with AI'}
              </Button>
            </div>

            <MarkdownEditor
              value={form.markdown}
              onChange={(next) => setForm((prev) => ({ ...prev, markdown: next }))}
              height={500}
              placeholder="Start writing your blog…"
            />
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="flex gap-3">
              <Button onClick={() => handleSubmit('draft')} disabled={!canSubmit || loading} variant="outline">
                {loading ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button disabled={!canSubmit || loading} onClick={() => handleSubmit('published')}>
                {editingSlug ? 'Update & Publish' : 'Publish'}
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700">Live preview</h3>
              <div className="mt-3 space-y-2">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{form.title || form.topic || 'Blog title'}</h4>
                  <p className="text-xs text-slate-500">{form.audience || 'Audience TBD'} • {form.tone}</p>
                </div>
                {form.heroImage && (
                  <div className="overflow-hidden rounded-lg border border-slate-200 relative h-32 w-full">
                    {form.heroImage && (
                      <Image src={form.heroImage} alt="Hero" fill className="object-cover" />
                    )}
                  </div>
                )}
                <p className="text-sm text-slate-600">
                  {form.markdown.slice(0, 220) || 'Markdown preview will appear here once provided.'}
                  {form.markdown.length > 220 && '…'}
                </p>
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                  <div className="font-semibold text-slate-700">SEO Preview</div>
                  <div className="text-slate-900">{seoTitle}</div>
                  <div>{seoDescription}</div>
                  <div className="text-slate-400">https://adaptiq.com/blog/{(form.title || form.topic || 'new-post').toLowerCase().replace(/[^a-z0-9]+/g, '-')}</div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Recent blogs</h3>
              {recentBlogs.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No blog posts yet.</p>
              ) : (
                <div className="space-y-3">
                  {recentBlogs.map((blog) => (
                    <div
                      key={blog.id}
                      className={`
                            rounded-lg border px-3 py-2 transition-colors
                            ${blog.status === 'published'
                          ? 'border-green-200 bg-green-50/50'
                          : 'border-slate-100 hover:bg-slate-50'}
                        `}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium text-slate-800 line-clamp-1" title={blog.title}>{blog.title}</div>
                        <Badge variant={blog.status === 'published' ? 'success' : 'default'} size="sm">
                          {blog.status || 'draft'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-[10px] text-slate-400">
                          {blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : ''}
                        </div>
                        <div className="flex gap-2">
                          {blog.slug && (
                            <>
                              <button className="text-[10px] text-slate-500 hover:text-blue-600 underline" onClick={() => handleEdit(blog)}>
                                Edit
                              </button>
                              <button
                                className="text-[10px] text-slate-500 hover:text-purple-600 underline"
                                onClick={() => handleToggleStatus(blog)}
                              >
                                {blog.status === 'published' ? 'Draft' : 'Publish'}
                              </button>
                              <button className="text-[10px] text-slate-500 hover:text-red-600 underline" onClick={() => handleDelete(blog.slug!)}>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {result && !editingSlug && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-900">Blog saved</h3>
          <p className="text-sm text-sky-700">{result.title} — status {result.status}</p>
        </div>
      )}
    </div>
  );
}
