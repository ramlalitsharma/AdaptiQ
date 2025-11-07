'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface BlogSummary {
  id: string;
  title: string;
  status: string;
  createdAt?: string;
}

interface BlogCreatorStudioProps {
  recentBlogs: BlogSummary[];
}

export function BlogCreatorStudio({ recentBlogs }: BlogCreatorStudioProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    title: '',
    topic: '',
    audience: '',
    tone: 'In-depth yet accessible',
    callToAction: 'Invite readers to enroll in AdaptIQ',
    keywords: 'adaptive learning, ai quizzes',
    markdown: '# Outline\n- Intro\n- Key insight\n- CTA',
  });

  const canSubmit = useMemo(() => {
    if (mode === 'manual') {
      return Boolean(form.title.trim() && form.markdown.trim());
    }
    return Boolean((form.topic || form.title).trim());
  }, [form, mode]);

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
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
      };
      if (mode === 'manual') {
        payload.markdown = form.markdown;
      }

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create blog');
      }
      setResult(data.blog);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Blog Generator</h2>
            <p className="text-sm text-slate-500">Spin up long-form marketing content or publish manual Markdown drafts.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Button variant={mode === 'ai' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('ai')}>
              AI Article
            </Button>
            <Button variant={mode === 'manual' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('manual')}>
              Manual Markdown
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-600">
            Blog title
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Why Adaptive Learning Outperforms Static Curricula"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-600">
            AI topic focus
            <input
              value={form.topic}
              onChange={(e) => setForm((prev) => ({ ...prev, topic: e.target.value }))}
              placeholder="Adaptive assessments for competitive exams"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
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
            Keywords (comma separated)
            <input
              value={form.keywords}
              onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
              placeholder="adaptive learning, ai quiz, netlify"
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>

        {mode === 'manual' && (
          <label className="mt-6 block text-sm text-slate-600">
            Markdown body
            <textarea
              value={form.markdown}
              onChange={(e) => setForm((prev) => ({ ...prev, markdown: e.target.value }))}
              rows={12}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
            />
          </label>
        )}

        {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Button className="mt-6" onClick={handleSubmit} disabled={!canSubmit || loading}>
          {loading ? 'Generating…' : mode === 'ai' ? 'Generate article' : 'Publish draft'}
        </Button>
      </div>

      {result && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-sky-900">Blog drafted</h3>
          <p className="text-sm text-sky-700">{result.title} — status {result.status}</p>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-white/80 p-4 text-xs text-slate-700">
{result.markdown}
          </pre>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent blogs</h3>
        {recentBlogs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No blog posts yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {recentBlogs.map((blog) => (
              <div key={blog.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-slate-800">{blog.title}</div>
                  <div className="text-xs text-slate-400">{blog.createdAt ? new Date(blog.createdAt).toLocaleString() : ''}</div>
                </div>
                <Badge variant={blog.status === 'published' ? 'success' : blog.status === 'in_review' ? 'info' : 'default'}>
                  {blog.status || 'draft'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
