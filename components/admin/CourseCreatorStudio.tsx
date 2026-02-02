'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WorkflowControls } from '@/components/admin/WorkflowControls';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { VideoUploader } from '@/components/video/VideoUploader';
import { ManualEnrollment } from '@/components/admin/ManualEnrollment';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { CourseOutlineEditor } from '@/components/admin/CourseOutlineEditor';
import { Sparkles, History, Box, Activity } from 'lucide-react';

interface CourseSummary {
  id: string;
  slug: string;
  title: string;
  status: string;
  level?: string;
  createdAt?: string;
}

interface SelectedCourse extends Partial<CourseSummary> {
  summary?: string;
  subject?: string;
  level?: string;
  language?: string;
  tags?: string[];
  thumbnail?: string;
  metadata?: {
    audience?: string;
    goals?: string;
    tone?: string;
    modulesCount?: number;
    lessonsPerModule?: number;
  };
  price?: { currency: string; amount: number } | null;
  seo?: { title?: string; description?: string; keywords?: string[] };
  categoryId?: string;
  units?: Array<{
    title: string;
    chapters?: Array<{
      title: string;
      lessons?: Array<{
        title: string;
        contentType: string;
        content?: string;
      }>;
    }>;
  }>;
  resources?: Array<{ type: 'video' | 'pdf' | 'link' | 'image'; label?: string; url: string }>;
}

interface CourseCreatorStudioProps {
  recentCourses: CourseSummary[];
  selectedCourse?: SelectedCourse;
}

interface ManualChapter {
  id?: string;
  title: string;
  lessons: ManualLesson[];
}

interface ManualLesson {
  id?: string;
  title: string;
  contentType: 'video' | 'live' | 'quiz' | 'document' | 'text' | 'video-link';
  content?: string;
  videoUrl?: string;
  liveRoomId?: string;
}
interface ManualUnit {
  id?: string;
  title: string;
  chapters: ManualChapter[];
}

interface CourseResource {
  type: 'video' | 'pdf' | 'link' | 'image';
  label: string;
  url: string;
}
const DEFAULT_FORM = {
  title: '',
  categoryId: '',
  subject: '',
  level: '',
  summary: '',
  audience: '',
  goals: '',
  tone: 'Professional and encouraging',
  unitsCount: 4,
  chaptersPerUnit: 2,
  lessonsPerChapter: 3,
  language: 'English',
  tags: 'adaptive learning, ai quizzes',
  priceAmount: '',
  priceCurrency: 'USD',
  seoTitle: '',
  seoDescription: '',
  thumbnail: '',
};

export function CourseCreatorStudio({ recentCourses, selectedCourse }: CourseCreatorStudioProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({ ...DEFAULT_FORM });
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<ManualUnit[]>([
    {
      title: 'Introduction Unit',
      chapters: [
        {
          title: 'Getting Started',
          lessons: [{ title: 'Welcome', content: 'Overview and objectives.', contentType: 'text' }]
        }
      ]
    },
  ]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>('draft');
  const [courseList, setCourseList] = useState<CourseSummary[]>(recentCourses);

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories || []))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  useEffect(() => {
    setCourseList(recentCourses);
  }, [recentCourses]);

  // Hydrate form when editing an existing course
  useEffect(() => {
    if (!selectedCourse) {
      setEditingSlug(null);
      setCurrentStatus('draft');
      setForm({ ...DEFAULT_FORM });
      setUnits([{
        title: 'Introduction Unit',
        chapters: [{
          title: 'Getting Started',
          lessons: [{ title: 'Welcome', content: 'Overview and objectives.', contentType: 'text' }]
        }]
      }]);
      setResources([]);
      setMode('ai');
      return;
    }

    setEditingSlug(selectedCourse.slug || null);
    setMode('manual');
    setCurrentStatus(selectedCourse.status || 'draft');
    setForm({
      title: selectedCourse.title || '',
      categoryId: selectedCourse.categoryId || '',
      subject: selectedCourse.subject || '',
      level: selectedCourse.level || '',
      summary: selectedCourse.summary || '',
      audience: selectedCourse.metadata?.audience || '',
      goals: selectedCourse.metadata?.goals || '',
      tone: selectedCourse.metadata?.tone || DEFAULT_FORM.tone,
      unitsCount: (selectedCourse.metadata as any)?.modulesCount || DEFAULT_FORM.unitsCount,
      chaptersPerUnit: DEFAULT_FORM.chaptersPerUnit,
      lessonsPerChapter: (selectedCourse.metadata as any)?.lessonsPerModule || DEFAULT_FORM.lessonsPerChapter,
      language: selectedCourse.language || DEFAULT_FORM.language,
      tags: (selectedCourse.tags || []).join(', ') || DEFAULT_FORM.tags,
      priceAmount: selectedCourse.price?.amount ? String(selectedCourse.price.amount) : '',
      priceCurrency: selectedCourse.price?.currency || DEFAULT_FORM.priceCurrency,
      seoTitle: selectedCourse.seo?.title || '',
      seoDescription: selectedCourse.seo?.description || '',
      thumbnail: selectedCourse.thumbnail || '',
    });

    // Handle legacy modules or new units
    const sourceUnits = selectedCourse.units || (selectedCourse as any).modules || [];
    setUnits(
      sourceUnits.map((u: any) => ({
        title: u.title,
        chapters: (u.chapters || [{ title: 'Main Lessons', lessons: u.lessons || [] }]).map((c: any) => ({
          title: c.title,
          lessons: (c.lessons || []).map((l: any) => ({
            title: l.title,
            content: l.content || '',
            contentType: l.contentType || 'text'
          })),
        })),
      })) || [],
    );
    setResources(
      (selectedCourse.resources || []).map((resource) => ({
        type: resource.type || 'link',
        label: resource.label || '',
        url: resource.url,
      })) || [],
    );
  }, [selectedCourse?.slug]);

  // Curriculum helper functions for the new hierarchy
  const updateUnitTitle = (index: number, title: string) => {
    setUnits((prev) => prev.map((u, i) => (i === index ? { ...u, title } : u)));
  };

  const addUnit = () => {
    setUnits((prev) => [...prev, {
      title: `Unit ${prev.length + 1}`,
      chapters: [{ title: 'Chapter 1', lessons: [] }]
    }]);
  };

  const removeUnit = (index: number) => {
    setUnits((prev) => prev.filter((_, i) => i !== index));
  };

  const updateResource = (index: number, key: keyof CourseResource, value: string) => {
    setResources((prev) => prev.map((resource, i) => (i === index ? { ...resource, [key]: value } : resource)));
  };

  const addResource = () => {
    setResources((prev) => [...prev, { type: 'link', label: '', url: '' }]);
  };

  const removeResource = (index: number) => {
    setResources((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = useMemo(() => {
    if (!form.title.trim()) return false;
    if (mode === 'manual' || editingSlug) {
      return units.length > 0 && units.every(u => u.title.trim());
    }
    return true;
  }, [form.title, mode, units, editingSlug]);

  const handleGenerateOutline = async () => {
    if (!form.title.trim()) {
      setError('Provide a course title before generating an outline.');
      return;
    }
    setError(null);
    setGeneratingPreview(true);
    try {
      const payload = {
        title: form.title.trim(),
        subject: form.subject.trim() || undefined,
        level: form.level || undefined,
        audience: form.audience.trim() || undefined,
        goals: form.goals.trim() || undefined,
        tone: form.tone.trim() || undefined,
        modulesCount: Number(form.unitsCount) || undefined,
        lessonsPerModule: Number(form.lessonsPerChapter) || undefined,
      };
      const res = await fetch('/api/admin/courses/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate outline');
      }

      // Mapping AI modules to the new Unit -> Chapter -> Lesson hierarchy
      const generatedUnits: ManualUnit[] = (data.outline.modules || []).map((module: any) => ({
        title: module.title,
        chapters: [{
          title: 'Core Concepts',
          lessons: (module.lessons || []).map((lesson: any) => ({
            title: lesson.title,
            content: lesson.content,
            contentType: 'text'
          })),
        }]
      }));

      if (generatedUnits.length) {
        setUnits(generatedUnits);
      }
      setFeedback('Outline generated. Review curriculum before saving.');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to generate outline');
    } finally {
      setGeneratingPreview(false);
    }
  };

  const buildCurriculumPayload = () =>
    units.map((unit) => ({
      title: unit.title,
      chapters: unit.chapters.map(chapter => ({
        title: chapter.title,
        lessons: chapter.lessons.map(lesson => ({
          title: lesson.title,
          content: lesson.content,
          contentType: lesson.contentType || 'text'
        }))
      }))
    }));

  const buildSharedPayload = () => ({
    title: form.title.trim(),
    categoryId: form.categoryId || undefined,
    summary: form.summary.trim() || undefined,
    subject: form.subject.trim() || undefined,
    level: form.level || undefined,
    language: form.language.trim() || undefined,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    thumbnail: form.thumbnail.trim() || undefined,
    resources: resources.filter((resource) => resource.label.trim() && resource.url.trim()),
    price: form.priceAmount
      ? {
        currency: form.priceCurrency || 'USD',
        amount: Number(form.priceAmount),
      }
      : undefined,
    seo: {
      title: form.seoTitle.trim() || undefined,
      description: form.seoDescription.trim() || undefined,
      keywords: form.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    },
    metadata: {
      audience: form.audience.trim() || undefined,
      goals: form.goals.trim() || undefined,
      tone: form.tone.trim() || undefined,
      unitsCount: units.length,
      lessonsCount: units.reduce((acc, u) => acc + u.chapters.reduce((cAcc, c) => cAcc + c.lessons.length, 0), 0),
    },
  });

  const handleQuickStatus = async (slug: string, status: 'draft' | 'published') => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/courses/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to update course status to ${status}`);
      }
      if (editingSlug === slug) {
        setCurrentStatus(status);
      }
      setCourseList((prev) =>
        prev.map((course) => (course.slug === slug ? { ...course, status } : course)),
      );
      setFeedback(`Course marked as ${status}.`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Unable to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (nextStatus?: string) => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      if (editingSlug) {
        const payload: any = {
          ...buildSharedPayload(),
          units: units.map(u => ({
            title: u.title,
            chapters: u.chapters.map(c => ({
              title: c.title,
              lessons: c.lessons.map(l => ({
                title: l.title,
                content: l.content,
                contentType: (l as any).contentType || 'text'
              }))
            }))
          })),
        };
        if (nextStatus) payload.status = nextStatus;
        const res = await fetch(`/api/admin/courses/${editingSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to update course');
        }
        setFeedback(nextStatus ? `Course status updated to ${nextStatus}.` : 'Course updated successfully.');
        router.refresh();
      } else {
        const payload: any = {
          mode,
          ...buildSharedPayload(),
        };
        if (mode === 'manual' || units.length) {
          payload.units = units.map(u => ({
            title: u.title,
            chapters: u.chapters.map(c => ({
              title: c.title,
              lessons: c.lessons.map(l => ({
                title: l.title,
                content: l.content,
                contentType: (l as any).contentType || 'text'
              }))
            }))
          }));
        }
        const res = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to create course');
        }
        setResult(data.course);
        setFeedback('Course draft created successfully.');
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const clearEditing = () => {
    router.push('/admin/studio/courses');
  };

  return (
    <div className="space-y-12">
      <div className="glass-card-premium rounded-[3rem] border border-white/5 p-10">
        <div className="flex flex-wrap items-center justify-between gap-8">
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">
              {editingSlug ? 'Refine Architecture' : 'Initialize Curriculum'}
            </h2>
            <p className="text-sm text-slate-400 font-medium max-w-2xl leading-relaxed">
              {editingSlug
                ? 'Precision adjustment of modules, neural metadata, and global deployment parameters.'
                : 'Engineer adaptive learning paths with integrated AI acceleration and version-controlled logic.'}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
            <Button
              variant={mode === 'ai' ? 'inverse' : 'ghost'}
              size="sm"
              onClick={() => setMode('ai')}
              disabled={Boolean(editingSlug)}
              className={`rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest ${mode === 'ai' ? 'bg-elite-accent-cyan text-black' : 'text-slate-500 hover:text-white'}`}
            >
              Neural Mode
            </Button>
            <Button
              variant={mode === 'manual' ? 'inverse' : 'ghost'}
              size="sm"
              onClick={() => setMode('manual')}
              className={`rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest ${mode === 'manual' ? 'bg-elite-accent-cyan text-black' : 'text-slate-500 hover:text-white'}`}
            >
              Manual Override
            </Button>
            {editingSlug && (
              <Button variant="outline" size="sm" onClick={clearEditing} className="rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest border-white/10 text-white hover:bg-white/5">
                New Project
              </Button>
            )}
          </div>
        </div>

        {feedback && (
          <div className="mt-8 rounded-[2rem] border border-elite-accent-emerald/20 bg-elite-accent-emerald/10 p-5 text-[10px] font-black uppercase tracking-widest text-elite-accent-emerald flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-elite-accent-emerald animate-pulse" />
            {feedback}
          </div>
        )}
        {error && (
          <div className="mt-8 rounded-[2rem] border border-red-500/20 bg-red-500/10 p-5 text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-6 2xl:grid-cols-3">
          {/* Column 1: Metadata */}
          <section className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Course Parameters</h3>
            <div className="space-y-6">
              <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                Primary Headline
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Neural Mathematics Mastery"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all"
                />
              </label>
              <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                Deployment Sector
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-elite-bg">Uncategorized</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id} className="bg-elite-bg">
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                Subject Focus
                <input
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Theoretical Physics"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all"
                />
              </label>
              <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                Complexity Level
                <select
                  value={form.level}
                  onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all appearance-none"
                >
                  <option value="" className="bg-elite-bg">Auto detect</option>
                  <option value="basic" className="bg-elite-bg">Basic</option>
                  <option value="intermediate" className="bg-elite-bg">Intermediate</option>
                  <option value="advanced" className="bg-elite-bg">Advanced</option>
                </select>
              </label>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block">Abstract & Narrative</label>
                <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                  <TipTapEditor
                    value={form.summary}
                    onChange={(next) => setForm((prev) => ({ ...prev, summary: next }))}
                    placeholder="3-week accelerator to master adaptive testing."
                    height={180}
                  />
                </div>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Language Dialect
                  <input
                    value={form.language}
                    onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
                    placeholder="English"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all"
                  />
                </label>
                <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Neural Tags
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="adaptive, quantum, mastery"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all"
                  />
                </label>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Access Amount
                  <input
                    type="number"
                    value={form.priceAmount}
                    onChange={(e) => setForm((prev) => ({ ...prev, priceAmount: e.target.value }))}
                    placeholder="199"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all"
                  />
                </label>
                <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                  Sector Currency
                  <input
                    value={form.priceCurrency}
                    onChange={(e) => setForm((prev) => ({ ...prev, priceCurrency: e.target.value }))}
                    placeholder="USD"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all"
                  />
                </label>
              </div>
              <div className="pt-4">
                <ImageUploader
                  value={form.thumbnail}
                  onChange={(url) => setForm((prev) => ({ ...prev, thumbnail: url }))}
                  label="Architectural Cover"
                />
              </div>

              {(mode === 'ai' && !editingSlug) && (
                <div className="space-y-6 rounded-[2.5rem] border border-elite-accent-purple/20 bg-elite-accent-purple/5 p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-elite-accent-purple/10 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:scale-150" />
                  <div className="flex items-center gap-3">
                    <Sparkles size={16} className="text-elite-accent-purple" />
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Neural Guidance</h4>
                  </div>
                  <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Target User Profile
                    <input
                      value={form.audience}
                      onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                      placeholder="Aspiring Quantum Engineers"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white placeholder:text-white/10 focus:border-elite-accent-purple/50 outline-none"
                    />
                  </label>
                  <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Expansion Goals
                    <input
                      value={form.goals}
                      onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                      placeholder="Harness neural networks for curriculum design"
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white placeholder:text-white/10 focus:border-elite-accent-purple/50 outline-none"
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                      Sector Hierarchy
                      <input
                        type="number"
                        min={1}
                        value={form.unitsCount}
                        onChange={(e) => setForm((prev) => ({ ...prev, unitsCount: Number(e.target.value) }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white outline-none"
                      />
                    </label>
                    <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                      Node Density
                      <input
                        type="number"
                        min={1}
                        value={form.lessonsPerChapter}
                        onChange={(e) => setForm((prev) => ({ ...prev, lessonsPerChapter: Number(e.target.value) }))}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-white outline-none"
                      />
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    disabled={generatingPreview}
                    onClick={handleGenerateOutline}
                    className="w-full h-12 rounded-xl bg-elite-accent-purple text-black font-black uppercase text-[10px] tracking-[0.2em] border-none hover:bg-white transition-all shadow-lg shadow-elite-accent-purple/20"
                  >
                    {generatingPreview ? 'Synthesizing...' : 'Initialize Neural Synthesis'}
                  </Button>
                </div>
              )}

              <div className="pt-8 border-t border-white/5 space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Global Discovery (SEO)</h4>
                <div className="space-y-6">
                  <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Meta Headline
                    <input
                      value={form.seoTitle}
                      onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder="Master Quantum Dynamics with Refectl"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all"
                    />
                  </label>
                  <label className="space-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500 block">
                    Meta Description
                    <textarea
                      value={form.seoDescription}
                      onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                      placeholder="Deep dive into advanced neural architectures..."
                      rows={3}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-white placeholder:text-white/10 focus:border-elite-accent-cyan/50 focus:ring-1 focus:ring-elite-accent-cyan/20 outline-none transition-all resize-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Column 2: Outline Builder */}
          <section className="space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Curriculum Architecture</h3>
            <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <Box size={14} className="text-elite-accent-cyan" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white">Hierarchical Structure</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnits([...units, { title: 'New Sector', chapters: [] }])}
                className="h-9 px-4 rounded-xl border-white/10 text-white hover:bg-white/5 text-[9px] font-black uppercase tracking-widest"
              >
                + Initialize Sector
              </Button>
            </div>

            <div className="space-y-6">
              <CourseOutlineEditor
                units={units}
                onChange={setUnits}
              />
            </div>

            {editingSlug && (
              <div className="space-y-8 pt-10 mt-10 border-t border-white/5">
                <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Deployment Protocol</h4>
                  <WorkflowControls
                    contentType="course"
                    contentId={editingSlug}
                    status={currentStatus}
                    onStatusChange={(status) => {
                      setCurrentStatus(status);
                      setFeedback(`Status updated to ${status}.`);
                      router.refresh();
                    }}
                  />
                </div>
                <div className="rounded-[2.5rem] border border-white/5 bg-white/5 p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6 flex items-center gap-2">
                    <Activity size={12} className="text-elite-accent-cyan" />
                    Manual Provisioning
                  </h4>
                  <ManualEnrollment
                    courseId={selectedCourse?.id || editingSlug}
                    courseTitle={form.title || selectedCourse?.title}
                    onEnrolled={() => {
                      setFeedback('Student provisioned successfully.');
                      router.refresh();
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-10">
              <Button
                onClick={() => handleSubmit()}
                disabled={!canSubmit || loading}
                className="h-14 px-10 rounded-2xl bg-white text-black font-black uppercase text-[10px] tracking-widest hover:bg-elite-accent-cyan transition-all shadow-xl shadow-white/5"
              >
                {loading ? 'Storing...' : editingSlug ? 'Update Architecture' : 'Store Draft Entry'}
              </Button>
              {editingSlug && (
                <Button
                  variant="outline"
                  disabled={loading || !canSubmit}
                  onClick={() => handleSubmit('published')}
                  className="h-14 px-10 rounded-2xl border-white/10 text-white font-black uppercase text-[10px] tracking-widest hover:bg-white/5"
                >
                  Global Deployment
                </Button>
              )}
            </div>
          </section>

          {/* Column 3: Preview & History */}
          <aside className="space-y-12">
            <CoursePreviewPanel form={form} units={units} resources={resources} />

            <div className="glass-card-premium rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-elite-accent-cyan/10 transition-all" />
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 flex items-center gap-3">
                  <History size={14} className="text-elite-accent-cyan" />
                  Asset Ledger
                </h3>
              </div>
              {courseList.length === 0 ? (
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-600 text-center py-10 border border-dashed border-white/5 rounded-2xl">Ledger Empty</p>
              ) : (
                <div className="space-y-4">
                  {courseList.slice(0, 5).map((course) => {
                    const isActive = editingSlug === course.slug;
                    return (
                      <div
                        key={course.id}
                        className={`group/item rounded-2xl border px-5 py-4 transition-all hover:bg-white/5 ${isActive
                          ? 'border-elite-accent-cyan bg-elite-accent-cyan/10 text-white'
                          : 'border-white/5 text-slate-400 hover:border-white/20'
                          }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <div className={`font-bold line-clamp-1 text-xs uppercase tracking-tight ${isActive ? 'text-white' : 'text-slate-200'}`}>{course.title}</div>
                            <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">
                              {course.level ? `${course.level} • ` : ''}
                              {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ''}
                            </div>
                          </div>
                          <Badge variant={course.status === 'published' ? 'success' : course.status === 'in_review' ? 'info' : 'default'} className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-none">
                            {course.status}
                          </Badge>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 opacity-0 group-hover/item:opacity-100 transition-all translate-y-2 group-hover/item:translate-y-0">
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-white/5 text-white hover:bg-elite-accent-cyan hover:text-black rounded-lg"
                            onClick={() => router.push(`/admin/studio/courses?slug=${course.slug}`)}
                          >
                            Access
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-white/5 text-white hover:bg-elite-accent-emerald hover:text-black rounded-lg"
                            onClick={() => handleQuickStatus(course.slug, 'published')}
                            disabled={loading}
                          >
                            Deploy
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {result && !editingSlug && (
        <div className="rounded-[2.5rem] border border-elite-accent-emerald/20 bg-elite-accent-emerald/5 p-8 mt-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-emerald/10 rounded-full blur-3xl -mr-16 -mt-16" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-emerald mb-4">Architecture Initialized</h3>
          <p className="text-xl font-black text-white tracking-tighter uppercase mb-6">{result.title} — Sector Status: {result.status}</p>
          <pre className="max-h-72 overflow-auto rounded-2xl bg-black/40 border border-white/5 p-6 text-[10px] text-slate-400 font-mono custom-scrollbar">
            {JSON.stringify(result.units || result.modules, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function CoursePreviewPanel({
  form,
  units,
  resources,
}: {
  form: {
    title: string;
    subject: string;
    summary: string;
    level: string;
    language: string;
    tags: string;
    seoTitle: string;
    seoDescription: string;
  };
  units: ManualUnit[];
  resources: CourseResource[];
}) {
  const seoTitle = form.seoTitle || `${form.title} | Global Preview`;
  const seoDescription = form.seoDescription || form.summary;

  return (
    <div className="glass-card-premium rounded-[2.5rem] border border-white/5 p-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-125 transition-all" />
      <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Neural Visualization</h3>
      <div className="space-y-8">
        <div>
          <h4 className="text-2xl font-black text-white tracking-tighter uppercase leading-none mb-3">
            {form.title || 'Inertia Variable'}
          </h4>
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-elite-accent-cyan px-2 py-1 bg-elite-accent-cyan/10 rounded-lg">
              {form.subject || 'Domain Unknown'}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
              {form.level || 'Adaptive'}
            </span>
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 py-1 bg-white/5 rounded-lg border border-white/5">
              {form.language || 'Global'}
            </span>
          </div>
        </div>

        <p className="text-sm text-slate-400 font-medium leading-relaxed">
          {form.summary || 'Initiate narrative synthesis to visualize abstract...'}
        </p>

        <div className="space-y-4">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Sector Hierarchy map</span>
          <div className="grid gap-3">
            {units.slice(0, 3).map((unit, index) => {
              const lessonCount = unit.chapters.reduce((acc, c) => acc + c.lessons.length, 0);
              return (
                <div key={index} className="rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-elite-accent-cyan/30 transition-all">
                  <div className="font-black text-white text-[10px] uppercase tracking-widest flex items-center justify-between">
                    {unit.title || `Node ${index + 1}`}
                    <span className="text-[8px] text-elite-accent-cyan">{lessonCount} Assets</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-elite-accent-cyan/50 w-1/3" />
                  </div>
                </div>
              );
            })}
            {units.length > 3 && <div className="text-[9px] font-black uppercase tracking-widest text-slate-600 pl-2">+ {units.length - 3} Deep Layers</div>}
          </div>
        </div>

        {resources.length > 0 && (
          <div className="space-y-3">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">Asset Relay</span>
            <div className="flex flex-wrap gap-2">
              {resources.map((resource, index) => (
                <span key={index} className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded bg-white/5 border border-white/5 text-slate-400">
                  {resource.type}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-white/5 bg-black/40 p-6 text-[10px] space-y-3 backdrop-blur-xl">
          <div className="font-black text-slate-500 uppercase tracking-widest">Global Relay Protocol</div>
          <div className="text-white font-bold text-xs truncate">{seoTitle}</div>
          <div className="text-slate-400 leading-relaxed line-clamp-2">{seoDescription || 'Awaiting meta-relay input...'}</div>
          <div className="text-elite-accent-cyan truncate opacity-50 font-mono">https://refectl.ai/nodes/{form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'active-node'}</div>
        </div>
      </div>
    </div>
  );
}
