'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface CourseSummary {
  id: string;
  title: string;
  status: string;
  level?: string;
  createdAt?: string;
}

interface CourseCreatorStudioProps {
  recentCourses: CourseSummary[];
}

interface ManualLesson {
  title: string;
  content?: string;
}

interface ManualModule {
  title: string;
  lessons: ManualLesson[];
}

interface CourseResource {
  type: 'video' | 'pdf' | 'link' | 'image';
  label: string;
  url: string;
}

export function CourseCreatorStudio({ recentCourses }: CourseCreatorStudioProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const [form, setForm] = useState({
    title: '',
    subject: '',
    level: '',
    summary: '',
    audience: '',
    goals: '',
    tone: 'Professional and encouraging',
    modulesCount: 4,
    lessonsPerModule: 3,
    language: 'English',
    tags: 'adaptive learning, ai quizzes',
    priceAmount: '',
    priceCurrency: 'USD',
    seoTitle: '',
    seoDescription: '',
  });

  const [modules, setModules] = useState<ManualModule[]>([
    { title: 'Introduction', lessons: [{ title: 'Welcome', content: 'Overview and objectives.' }] },
  ]);

  const [resources, setResources] = useState<CourseResource[]>([]);

  const canSubmit = useMemo(() => {
    if (!form.title.trim()) return false;
    if (mode === 'manual') {
      return modules.every((module) => module.title.trim()) && modules.every((module) => module.lessons.every((lesson) => lesson.title.trim()));
    }
    return true;
  }, [form.title, mode, modules]);

  const updateModuleTitle = (index: number, title: string) => {
    setModules((prev) => prev.map((m, i) => (i === index ? { ...m, title } : m)));
  };

  const updateLesson = (moduleIndex: number, lessonIndex: number, key: keyof ManualLesson, value: string) => {
    setModules((prev) =>
      prev.map((module, mi) =>
        mi === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, li) => (li === lessonIndex ? { ...lesson, [key]: value } : lesson)),
            }
          : module,
      ),
    );
  };

  const addModule = () => {
    setModules((prev) => [...prev, { title: `Module ${prev.length + 1}`, lessons: [{ title: 'Lesson 1', content: '' }] }]);
  };

  const addLesson = (moduleIndex: number) => {
    setModules((prev) =>
      prev.map((module, mi) =>
        mi === moduleIndex
          ? { ...module, lessons: [...module.lessons, { title: `Lesson ${module.lessons.length + 1}`, content: '' }] }
          : module,
      ),
    );
  };

  const removeLesson = (moduleIndex: number, lessonIndex: number) => {
    setModules((prev) =>
      prev.map((module, mi) =>
        mi === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_, li) => li !== lessonIndex),
            }
          : module,
      ),
    );
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
        modulesCount: Number(form.modulesCount) || undefined,
        lessonsPerModule: Number(form.lessonsPerModule) || undefined,
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
      const generatedModules: ManualModule[] = (data.outline.modules || []).map((module: any) => ({
        title: module.title,
        lessons: (module.lessons || []).map((lesson: any) => ({ title: lesson.title, content: lesson.content })),
      }));
      if (generatedModules.length) {
        setModules(generatedModules);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Unable to generate outline');
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        mode,
        title: form.title.trim(),
        subject: form.subject.trim() || undefined,
        level: form.level || undefined,
        summary: form.summary.trim() || undefined,
        audience: form.audience.trim() || undefined,
        goals: form.goals.trim() || undefined,
        tone: form.tone.trim() || undefined,
        modulesCount: Number(form.modulesCount) || undefined,
        lessonsPerModule: Number(form.lessonsPerModule) || undefined,
        language: form.language.trim() || undefined,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
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
        resources: resources.filter((resource) => resource.label.trim() && resource.url.trim()),
      };

      if (mode === 'manual' || modules.length) {
        payload.outline = {
          modules: modules.map((module) => ({
            title: module.title,
            lessons: module.lessons.map((lesson) => ({ title: lesson.title, content: lesson.content })),
          })),
        };
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
            <h2 className="text-xl font-semibold text-slate-900">Course Authoring</h2>
            <p className="text-sm text-slate-500">Design curricula with AI suggestions, manual control, and rich metadata.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Button variant={mode === 'ai' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('ai')}>
              AI Mode
            </Button>
            <Button variant={mode === 'manual' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('manual')}>
              Manual Mode
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,0.85fr),minmax(0,1.15fr),minmax(0,0.9fr)]">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-800">Course metadata</h3>
            <div className="space-y-3">
              <label className="space-y-1 text-sm text-slate-600">
                Title
                <input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="AI-Powered Mathematics Mastery"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Subject
                <input
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Mathematics"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Level
                <select
                  value={form.level}
                  onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="">Auto detect</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Executive summary
                <textarea
                  value={form.summary}
                  onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="3-week accelerator to master adaptive testing."
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-600">
                  Language
                  <input
                    value={form.language}
                    onChange={(e) => setForm((prev) => ({ ...prev, language: e.target.value }))}
                    placeholder="English"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Tags
                  <input
                    value={form.tags}
                    onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="adaptive learning, ai quizzes"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm text-slate-600">
                  Price amount
                  <input
                    type="number"
                    value={form.priceAmount}
                    onChange={(e) => setForm((prev) => ({ ...prev, priceAmount: e.target.value }))}
                    placeholder="199"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-sm text-slate-600">
                  Currency
                  <input
                    value={form.priceCurrency}
                    onChange={(e) => setForm((prev) => ({ ...prev, priceCurrency: e.target.value }))}
                    placeholder="USD"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
              {mode === 'ai' && (
                <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-sm font-semibold text-slate-700">AI guidance</h4>
                  <label className="space-y-1 text-xs text-slate-600">
                    Target audience
                    <input
                      value={form.audience}
                      onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                      placeholder="University freshmen, aspiring product managers"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1 text-xs text-slate-600">
                    Learning outcomes
                    <input
                      value={form.goals}
                      onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                      placeholder="Build adaptive quizzes, analyze performance dashboards"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1 text-xs text-slate-600">
                    Tone or style
                    <input
                      value={form.tone}
                      onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                      placeholder="Accessible, hands-on, inspiring"
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1 text-xs text-slate-600">
                      Module count
                      <input
                        type="number"
                        min={2}
                        value={form.modulesCount}
                        onChange={(e) => setForm((prev) => ({ ...prev, modulesCount: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1 text-xs text-slate-600">
                      Lessons per module
                      <input
                        type="number"
                        min={2}
                        value={form.lessonsPerModule}
                        onChange={(e) => setForm((prev) => ({ ...prev, lessonsPerModule: Number(e.target.value) }))}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2"
                      />
                    </label>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={generatingPreview}
                    onClick={handleGenerateOutline}
                  >
                    {generatingPreview ? 'Generating outline…' : 'Generate outline draft'}
                  </Button>
                </div>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">Resource links</span>
                  <Button variant="outline" size="sm" onClick={addResource}>
                    + Resource
                  </Button>
                </div>
                {resources.length === 0 && <p className="text-xs text-slate-400">Add supportive videos, PDFs, or external links.</p>}
                <div className="space-y-3">
                  {resources.map((resource, index) => (
                    <div key={index} className="rounded-lg border border-slate-200 p-3 space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={resource.type}
                          onChange={(e) => updateResource(index, 'type', e.target.value)}
                          className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        >
                          <option value="link">Link</option>
                          <option value="video">Video</option>
                          <option value="pdf">PDF</option>
                          <option value="image">Image</option>
                        </select>
                        <input
                          value={resource.label}
                          onChange={(e) => updateResource(index, 'label', e.target.value)}
                          placeholder="Resource title"
                          className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={resource.url}
                          onChange={(e) => updateResource(index, 'url', e.target.value)}
                          placeholder="https://"
                          className="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs"
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeResource(index)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-700">SEO metadata</h4>
                <label className="space-y-1 text-xs text-slate-600">
                  SEO title
                  <input
                    value={form.seoTitle}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                    placeholder="Master adaptive learning with AdaptIQ"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
                <label className="space-y-1 text-xs text-slate-600">
                  SEO description
                  <textarea
                    value={form.seoDescription}
                    onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                    placeholder="Personalized adaptive course with AI-driven analytics."
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Outline builder</h3>
              <Button variant="outline" size="sm" onClick={addModule}>
                + Module
              </Button>
            </div>
            <div className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <div key={moduleIndex} className="rounded-xl border border-slate-200 p-4">
                  <label className="space-y-1 text-sm text-slate-600 block">
                    Module title
                    <input
                      value={module.title}
                      onChange={(e) => updateModuleTitle(moduleIndex, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2"
                    />
                  </label>
                  <div className="mt-3 space-y-3">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lessonIndex} className="rounded-lg border border-slate-100 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <label className="flex-1 text-sm text-slate-600">
                            Lesson title
                            <input
                              value={lesson.title}
                              onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                              className="w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLesson(moduleIndex, lessonIndex)}
                            disabled={module.lessons.length <= 1}
                          >
                            Remove
                          </Button>
                        </div>
                        <label className="mt-2 block text-xs text-slate-500">
                          Lesson notes / content bullets
                          <textarea
                            value={lesson.content || ''}
                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'content', e.target.value)}
                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2"
                            rows={3}
                          />
                        </label>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addLesson(moduleIndex)}>
                      + Lesson
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}
            <div className="flex gap-3">
              <Button onClick={handleSubmit} disabled={!canSubmit || loading}>
                {loading ? 'Saving…' : 'Save Draft'}
              </Button>
              <Button variant="outline" disabled={loading || !canSubmit} onClick={() => handleSubmit()}>
                Publish Draft
              </Button>
            </div>
          </section>

          <aside className="space-y-4">
            <CoursePreviewPanel
              form={form}
              modules={modules}
              resources={resources}
            />
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent courses</h3>
              {recentCourses.length === 0 ? (
                <p className="mt-3 text-xs text-slate-500">No courses created yet.</p>
              ) : (
                <div className="mt-3 space-y-3">
                  {recentCourses.map((course) => (
                    <div key={course.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2">
                      <div>
                        <div className="text-sm font-medium text-slate-800">{course.title}</div>
                        <div className="text-xs text-slate-400">
                          {course.level ? `${course.level} • ` : ''}{course.createdAt ? new Date(course.createdAt).toLocaleString() : ''}
                        </div>
                      </div>
                      <Badge variant={course.status === 'published' ? 'success' : course.status === 'in_review' ? 'info' : 'default'}>
                        {course.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {result && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-emerald-900">Course drafted</h3>
          <p className="text-sm text-emerald-700">{result.title} — status {result.status}</p>
          <pre className="mt-3 max-h-72 overflow-auto rounded-lg bg-white/80 p-4 text-xs text-slate-700">
{JSON.stringify(result.modules, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function CoursePreviewPanel({
  form,
  modules,
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
  modules: ManualModule[];
  resources: CourseResource[];
}) {
  const seoTitle = form.seoTitle || `${form.title} | Course Preview`;
  const seoDescription = form.seoDescription || form.summary;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700">Live preview</h3>
      <div className="mt-3 space-y-2">
        <div>
          <h4 className="text-lg font-semibold text-slate-900">{form.title || 'Course title'}</h4>
          <p className="text-xs text-slate-500">{form.subject && `${form.subject} • `}{form.level || 'Level TBD'} • {form.language || 'Language TBD'}</p>
        </div>
        <p className="text-sm text-slate-600">{form.summary || 'A compelling summary will appear here once provided.'}</p>
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Curriculum</span>
          <ul className="space-y-1 text-sm text-slate-600">
            {modules.slice(0, 6).map((module, index) => (
              <li key={index} className="rounded-lg bg-white px-3 py-2 shadow-sm">
                <div className="font-medium text-slate-800">{module.title}</div>
                <div className="text-xs text-slate-500">
                  {module.lessons.length} lesson{module.lessons.length === 1 ? '' : 's'}
                </div>
              </li>
            ))}
            {modules.length > 6 && <li className="text-xs text-slate-400">+ {modules.length - 6} more modules</li>}
          </ul>
        </div>
        {resources.length > 0 && (
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resources</span>
            <ul className="text-xs text-slate-500 space-y-1">
              {resources.map((resource, index) => (
                <li key={index}>
                  {resource.label || resource.url} ({resource.type})
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
          <div className="font-semibold text-slate-700">SEO Preview</div>
          <div className="text-slate-900">{seoTitle}</div>
          <div>{seoDescription || 'Add an SEO description to improve discoverability.'}</div>
          <div className="text-slate-400">https://adaptiq.com/courses/{form.title ? form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'your-course'}</div>
        </div>
      </div>
    </div>
  );
}
