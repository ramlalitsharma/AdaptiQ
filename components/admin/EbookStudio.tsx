'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface EbookSummary {
  id: string;
  title: string;
  updatedAt?: string;
}

interface EbookStudioProps {
  recentEbooks: EbookSummary[];
}

interface ChapterOutline {
  title: string;
  summary: string;
  keyTakeaways: string;
  resources: string;
  content?: string;
}

export function EbookStudio({ recentEbooks }: EbookStudioProps) {
  const [form, setForm] = useState({
    title: '',
    audience: '',
    tone: 'Practical and inspiring',
    focus: 'Adaptive learning strategies',
    chapters: 6,
    tags: 'ebook, adaptive',
    releaseAt: '',
  });
  const [chapters, setChapters] = useState<ChapterOutline[]>([
    { title: 'Chapter 1', summary: 'Outline the challenge and opportunity.', keyTakeaways: '• Adaptive learning overview', resources: '' },
  ]);
  const [previewing, setPreviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [seo, setSeo] = useState<any>(null);

  const canSubmit = useMemo(() => form.title.trim().length > 0 && chapters.every((chapter) => chapter.title.trim()), [form.title, chapters]);

  const updateChapter = (index: number, key: keyof ChapterOutline, value: string) => {
    setChapters((prev) => prev.map((chapter, i) => (i === index ? { ...chapter, [key]: value } : chapter)));
  };

  const addChapter = () => {
    setChapters((prev) => [
      ...prev,
      {
        title: `Chapter ${prev.length + 1}`,
        summary: 'Describe major insight.',
        keyTakeaways: '• Key idea 1\n• Key idea 2',
        resources: '',
      },
    ]);
  };

  const removeChapter = (index: number) => setChapters((prev) => prev.filter((_, i) => i !== index));

  const regenerateChapter = async (index: number) => {
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ebooks/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          audience: form.audience,
          tone: form.tone,
          focus: form.focus,
          chapterIndex: index,
          mode: 'chapter',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to regenerate chapter');
      const chapter = (data.outline.chapters || [])[0];
      if (chapter) {
        setChapters((prev) =>
          prev.map((c, i) =>
            i === index
              ? {
                title: chapter.title || c.title,
                summary: chapter.summary || c.summary,
                keyTakeaways: (chapter.keyTakeaways || []).map((item: string) => `• ${item}`).join('\n'),
                resources: (chapter.resources || []).join('\n'),
                content: typeof chapter.content === 'string' ? chapter.content : c.content || '',
              }
              : c
          )
        );
      }
    } catch (err: any) {
      setError(err.message || 'Unable to regenerate chapter');
    } finally {
      setPreviewing(false);
    }
  };
  const handleGenerateOutline = async () => {
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ebooks/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          audience: form.audience,
          tone: form.tone,
          chapters: form.chapters,
          focus: form.focus,
          mode: 'outline',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate outline');
      const generated = (data.outline.chapters || []).map((chapter: any) => ({
        title: chapter.title,
        summary: chapter.summary,
        keyTakeaways: (chapter.keyTakeaways || []).map((item: string) => `• ${item}`).join('\n'),
        resources: (chapter.resources || []).join('\n'),
      }));
      if (generated.length) setChapters(generated);
    } catch (err: any) {
      setError(err.message || 'Unable to generate outline');
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerateFull = async () => {
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ebooks/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          audience: form.audience,
          tone: form.tone,
          chapters: form.chapters,
          focus: form.focus,
          mode: 'full',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate draft');
      const generated = (data.outline.chapters || []).map((chapter: any) => ({
        title: chapter.title,
        summary: chapter.summary,
        keyTakeaways: (chapter.keyTakeaways || []).map((item: string) => `• ${item}`).join('\n'),
        resources: (chapter.resources || []).join('\n'),
        content: typeof chapter.content === 'string' ? chapter.content : '',
      }));
      if (generated.length) setChapters(generated);
      if (data.seo) setSeo(data.seo);
    } catch (err: any) {
      setError(err.message || 'Unable to generate draft');
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerateSEO = async () => {
    setPreviewing(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/ebooks/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          audience: form.audience,
          tone: form.tone,
          focus: form.focus,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          mode: 'seo',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate SEO');
      setSeo(data.seo);
    } catch (err: any) {
      setError(err.message || 'Unable to generate SEO');
    } finally {
      setPreviewing(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        audience: form.audience.trim() || undefined,
        tone: form.tone.trim() || undefined,
        focus: form.focus.trim() || undefined,
        chapters: form.chapters ? Number(form.chapters) : undefined,
        outline: {
          chapters: chapters.map((chapter) => ({
            title: chapter.title,
            summary: chapter.summary,
            keyTakeaways: chapter.keyTakeaways
              .split('\n')
              .map((line) => line.replace(/^•\s?/, '').trim())
              .filter(Boolean),
            resources: chapter.resources
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean),
            content: chapter.content || '',
          })),
        },
        releaseAt: form.releaseAt || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        seo: seo || undefined,
      };

      const res = await fetch('/api/admin/ebooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save ebook');
      setResult(data.ebookId);
    } catch (err: any) {
      setError(err.message || 'Unable to save ebook');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="glass-card-premium rounded-[3rem] border border-slate-200 dark:border-white/5 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-elite-accent-cyan/10 dark:bg-elite-accent-cyan/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-8 mb-12 border-b border-slate-100 dark:border-white/5 pb-10">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">Protocol: Ebook Engineering</h2>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Intelligence <span className="text-gradient-cyan">Synthesis Hub</span></h3>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-elite-accent-cyan/50 text-[10px] font-black uppercase tracking-widest h-12 px-6 shadow-sm"
              onClick={handleGenerateOutline}
              disabled={previewing || !form.title}
            >
              {previewing ? 'Sychronizing...' : '⚡ Generate Logic Map'}
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-elite-accent-purple/50 text-[10px] font-black uppercase tracking-widest h-12 px-6 shadow-sm"
              onClick={handleGenerateFull}
              disabled={previewing || !form.title}
            >
              {previewing ? 'Manifesting...' : '🧬 Synthesize Draft'}
            </Button>
            <Button
              variant="outline"
              className="rounded-2xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-elite-accent-emerald/50 text-[10px] font-black uppercase tracking-widest h-12 px-6 shadow-sm"
              onClick={handleGenerateSEO}
              disabled={previewing || !form.title}
            >
              {previewing ? 'Computing...' : '🔍 Matrix SEO'}
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr),minmax(0,1.2fr),minmax(0,0.9fr)]">
          <section className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Node Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="ADAPTIVE LEARNING PLAYBOOK"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wider outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Target Neural Group</label>
              <input
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                placeholder="EDUCATORS, EXAM ASPIRANTS"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wider outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Linguistic Tone</label>
              <input
                value={form.tone}
                onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                placeholder="PRACTICAL AND INSPIRING"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wider outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Cognitive Core Focus</label>
              <input
                value={form.focus}
                onChange={(e) => setForm((prev) => ({ ...prev, focus: e.target.value }))}
                placeholder="ADAPTIVE ASSESSMENTS FOR COMPETITIVE EXAMS"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wider outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Segment Count</label>
                <input
                  type="number"
                  value={form.chapters}
                  onChange={(e) => setForm((prev) => ({ ...prev, chapters: Number(e.target.value) }))}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wider outline-none transition-all text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Deployment Schedule</label>
                <input
                  type="datetime-local"
                  value={form.releaseAt}
                  onChange={(e) => setForm((prev) => ({ ...prev, releaseAt: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wider outline-none transition-all invert dark:invert-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Archive Tags (Comma Separated)</label>
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="EBOOK, ADAPTIVE"
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-bold uppercase tracking-wider outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </section>

          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Segment Map</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={addChapter}
                className="rounded-xl bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest px-4"
              >
                + New Segment
              </Button>
            </div>
            <div className="space-y-6">
              {chapters.map((chapter, index) => (
                <div key={index} className="rounded-[2rem] border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-8 space-y-6 relative group transition-all hover:bg-slate-100 dark:hover:bg-white/[0.07] shadow-sm">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1 space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Segment {index + 1} Identifier</label>
                      <input
                        value={chapter.title}
                        onChange={(e) => updateChapter(index, 'title', e.target.value)}
                        className="w-full bg-white dark:bg-elite-bg border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-xl px-4 py-3 text-sm font-black uppercase tracking-wider outline-none text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-6">
                      {chapters.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChapter(index)}
                          className="text-red-500 hover:bg-red-500/10 text-[9px] font-black uppercase"
                        >
                          DELETE
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => regenerateChapter(index)}
                        disabled={previewing || !form.title}
                        className="rounded-xl bg-white/5 border-white/10 text-[9px] font-black uppercase tracking-widest px-4 hover:border-elite-accent-cyan/50"
                      >
                        REGENERATE
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Cognitive Summary</label>
                      <textarea
                        value={chapter.summary}
                        onChange={(e) => updateChapter(index, 'summary', e.target.value)}
                        rows={4}
                        className="w-full bg-white dark:bg-elite-bg border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-xl px-4 py-3 text-xs font-medium leading-relaxed outline-none text-slate-800 dark:text-slate-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Key Deliverables (One per line)</label>
                      <textarea
                        value={chapter.keyTakeaways}
                        onChange={(e) => updateChapter(index, 'keyTakeaways', e.target.value)}
                        rows={4}
                        className="w-full bg-white dark:bg-elite-bg border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-xl px-4 py-3 text-xs font-medium leading-relaxed outline-none text-slate-800 dark:text-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Intellectual Resources / Citations</label>
                    <textarea
                      value={chapter.resources}
                      onChange={(e) => updateChapter(index, 'resources', e.target.value)}
                      rows={2}
                      className="w-full bg-white dark:bg-elite-bg border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-xl px-4 py-3 text-xs font-medium leading-relaxed outline-none text-slate-800 dark:text-slate-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Deep Content Synthesis</label>
                    <textarea
                      value={chapter.content || ''}
                      onChange={(e) => updateChapter(index, 'content', e.target.value)}
                      rows={10}
                      className="w-full bg-white dark:bg-elite-bg border border-slate-200 dark:border-white/10 focus:border-elite-accent-cyan/50 rounded-2xl px-5 py-4 text-sm font-medium leading-loose outline-none text-slate-800 dark:text-slate-300"
                    />
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-[10px] font-black uppercase tracking-widest text-red-500">
                ⚠️ Protocol Failure: {error}
              </div>
            )}

            <Button
              className="w-full h-16 rounded-2xl bg-elite-accent-cyan text-black font-black uppercase text-xs tracking-[0.3em] shadow-2xl shadow-elite-accent-cyan/20 hover:scale-[1.02] active:scale-95 transition-all"
              onClick={handleSubmit}
              disabled={!canSubmit || saving}
            >
              {saving ? 'SYNCHRONIZING DATA...' : 'DEPLOY INTELLIGENCE ASSET'}
            </Button>
          </section>

          <aside className="space-y-6">
            <div className="glass-card-premium rounded-[2rem] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Real-Time Probe</h3>
              <div className="space-y-6">
                <div className="space-y-1">
                  <div className="text-lg font-black text-white uppercase tracking-tight">{form.title || 'UNNAMED NODE'}</div>
                  <div className="text-[9px] font-black text-elite-accent-cyan uppercase tracking-widest">
                    {form.audience || 'GENERAL AUDIENCE'} • {chapters.length} SEGMENTS
                  </div>
                </div>

                <div className="rounded-2xl bg-black/40 border border-white/5 p-6 text-[10px] font-medium leading-loose text-slate-400">
                  <span className="text-white font-black uppercase tracking-widest block mb-3 border-b border-white/5 pb-2">Structure Manifest</span>
                  <ol className="mt-3 space-y-3 list-none">
                    {chapters.map((chapter, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-elite-accent-cyan font-black">{(index + 1).toString().padStart(2, '0')}</span>
                        <div className="flex-1">
                          <span className="text-white font-bold uppercase block">{chapter.title || 'PENDING IDENTIFIER'}</span>
                          <span className="text-[9px] line-clamp-1 opacity-60">{(chapter.summary || 'Summary matrix empty').slice(0, 100)}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            <div className="glass-card-premium rounded-[2rem] border border-white/5 p-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Archived Nodes</h3>
              {recentEbooks.length === 0 ? (
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest text-center py-4">NO PREVIOUS DATA</p>
              ) : (
                <div className="space-y-4">
                  {recentEbooks.map((ebook) => (
                    <div key={ebook.id} className="group relative flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/[0.08] hover:border-elite-accent-cyan/30 transition-all cursor-pointer">
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-white uppercase tracking-wider truncate mb-1">{ebook.title}</div>
                        <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                          {ebook.updatedAt ? new Date(ebook.updatedAt).toLocaleDateString() : ''}
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 text-elite-accent-cyan transition-opacity text-xs">
                        ↗
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card-premium rounded-[2rem] border border-white/5 p-8 relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center justify-between">
                Matrix SEO
                {seo && <span className="w-2 h-2 rounded-full bg-elite-accent-emerald glow-emerald" />}
              </h3>
              {!seo ? (
                <div className="text-center py-8 space-y-4 border border-dashed border-white/10 rounded-2xl">
                  <div className="text-2xl grayscale opacity-30">🕸️</div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Metadata Empty</p>
                </div>
              ) : (
                <div className="space-y-6 text-[10px] font-medium text-slate-400">
                  <div className="space-y-1">
                    <span className="text-white font-black uppercase block tracking-widest">Title</span>
                    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5">{seo.seoTitle}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-white font-black uppercase block tracking-widest">Synthesis Description</span>
                    <div className="bg-white/5 rounded-lg px-3 py-2 border border-white/5 leading-relaxed">{seo.metaDescription}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-white font-black uppercase block tracking-widest">Key Vectors</span>
                      <div className="flex flex-wrap gap-1">
                        {(seo.keywords || []).map((k: string) => (
                          <span key={k} className="bg-elite-accent-cyan/10 text-elite-accent-cyan px-2 py-0.5 rounded text-[8px] font-black uppercase">{k}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-white font-black uppercase block tracking-widest">Node Path</span>
                      <div className="bg-white/5 rounded-lg px-2 py-1 border border-white/5 truncate">{seo.slug}</div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/40 border border-white/5 p-4 mt-4">
                    <span className="text-white font-black uppercase tracking-widest block mb-2 text-[9px]">Schema Matrix</span>
                    <pre className="whitespace-pre-wrap break-words text-[8px] font-mono text-slate-500 opacity-80">{JSON.stringify(seo.schemaOrg, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-700">
                Ebook saved successfully.
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
