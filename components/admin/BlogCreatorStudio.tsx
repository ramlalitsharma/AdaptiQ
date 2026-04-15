'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { MediaUploader } from '@/components/media/MediaUploader';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-primitive";
import { formatDistanceToNow } from 'date-fns';

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
    // Insert at cursor position would be ideal, but for now we append.
    setForm(prev => ({ ...prev, markdown: prev.markdown + '\n' + text }));
  };

  const insertVideo = () => {
    const url = prompt('Enter YouTube or Vimeo URL:');
    if (!url) return;
    // Simple embed logic
    let embed = url;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop();
      embed = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="rounded-xl my-6"></iframe>`;
    }
    insertContent(`\n${embed}\n`);
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
    } catch { }
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

  const recent24h = recentBlogs.filter(b => {
    if (!b.createdAt) return false;
    const date = new Date(b.createdAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 24 * 60 * 60 * 1000;
  });

  return (
    <div className="mx-auto max-w-7xl">
      <Tabs defaultValue="write" className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="write">✍️ Writer Studio</TabsTrigger>
            <TabsTrigger value="manage">📂 Manage All Blogs</TabsTrigger>
          </TabsList>
          {mode === 'ai' && !editingSlug && (
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700">
              ✨ AI Assistance Active
            </Badge>
          )}
        </div>

        <TabsContent value="write" className="space-y-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* AI / Manual Toggle */}
              {!editingSlug && (
                <div className="flex gap-4 p-1 bg-slate-100 rounded-lg w-fit">
                  <button
                    onClick={() => setMode('ai')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'ai' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    🤖 AI Auto-Draft
                  </button>
                  <button
                    onClick={() => setMode('manual')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${mode === 'manual' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    ✍️ Manual Write
                  </button>
                </div>
              )}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
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

                  <div className="pt-6 border-t border-slate-100">
                    <label className="text-sm font-semibold text-slate-800 mb-2 block">Attached Resources</label>
                    <div className="space-y-2">
                      {resources.map((r, i) => (
                        <div key={i} className="flex gap-2">
                          <input
                            className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
                            placeholder="Label"
                            value={r.label}
                            onChange={e => {
                              const newRes = [...resources];
                              newRes[i].label = e.target.value;
                              setResources(newRes);
                            }}
                          />
                          <input
                            className="flex-[2] rounded-md border border-slate-200 px-2 py-1 text-xs"
                            placeholder="URL"
                            value={r.url}
                            onChange={e => {
                              const newRes = [...resources];
                              newRes[i].url = e.target.value;
                              setResources(newRes);
                            }}
                          />
                          <button onClick={() => setResources(resources.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500">×</button>
                        </div>
                      ))}
                      <Button size="sm" variant="ghost" className="text-xs text-indigo-600 h-auto p-0 hover:bg-transparent" onClick={() => setResources([...resources, { label: '', url: '' }])}>
                        + Add Resource
                      </Button>
                    </div>
                  </div>
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
                  <Button size="sm" variant="outline" onClick={insertVideo}>
                    🎥 Video
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleImproveContent} disabled={improving || !form.markdown.trim()}>
                    {improving ? 'Improving…' : 'Improve with AI'}
                  </Button>
                </div>

                <TipTapEditor
                  value={form.markdown}
                  onChange={(html) => setForm((prev) => ({ ...prev, markdown: html }))}
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
            </div>

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
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Recent (24h)</h3>
                <div className="max-h-[300px] overflow-y-auto">
                  {recent24h.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-500">No blogs created today.</p>
                  ) : (
                    <div className="space-y-3">
                      {recent24h.map((blog) => (
                        <div
                          key={blog.id}
                          className={`rounded-lg border px-3 py-2 transition-colors cursor-pointer hover:bg-slate-50`}
                          onClick={() => loadBlog(blog.slug!)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-slate-900 text-xs truncate w-32">{blog.title}</div>
                            <Badge variant={blog.status === 'published' ? 'success' : 'default'} size="sm" className="text-[10px] px-1 py-0 h-4">
                              {blog.status}
                            </Badge>
                          </div>
                          <div className="text-[10px] text-slate-400">{formatDistanceToNow(new Date(blog.createdAt || Date.now()), { addSuffix: true })}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="manage" className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-900">All Blogs</h3>
              <p className="text-sm text-slate-500">Manage, edit, and track all your content.</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {recentBlogs.map((blog) => (
              <div key={blog.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${blog.status === 'published' ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <div>
                    <h4 className="font-medium text-slate-900">{blog.title}</h4>
                    <div className="text-xs text-slate-500 flex gap-2">
                      <span>/{blog.slug}</span>
                      <span>• {new Date(blog.createdAt || '').toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`/blog/${blog.slug}`} target="_blank" className="text-xs text-slate-500 hover:text-indigo-600 hover:underline px-2">View</a>
                  <Button size="sm" variant="outline" onClick={() => {
                    const trigger = document.querySelector('[value="write"]') as HTMLElement;
                    if (trigger) trigger.click();
                    handleEdit({ ...blog, id: blog.id || '' });
                  }}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {recentBlogs.length === 0 && (
            <div className="p-12 text-center text-slate-400">
              No blogs found. Start writing!
            </div>
          )}
        </TabsContent>
      </Tabs>

      {result && !editingSlug && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-900">Blog saved</h3>
          <p className="text-sm text-sky-700">{result.title} — status {result.status}</p>
        </div>
      )}
    </div>
  );
}
