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

interface ManualModule {
  title: string;
  lessons: ManualLesson[];
}

interface ManualLesson {
  title: string;
  content?: string;
}

export function CourseCreatorStudio({ recentCourses }: CourseCreatorStudioProps) {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [loading, setLoading] = useState(false);
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
  });
  const [modules, setModules] = useState<ManualModule[]>([
    { title: 'Introduction', lessons: [{ title: 'Welcome', content: 'Overview and objectives.' }] },
  ]);

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
      };

      if (mode === 'manual') {
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
            <p className="text-sm text-slate-500">Generate polished curricula with AI, or craft them manually with granular control.</p>
          </div>
          <div className="flex gap-2 text-sm">
            <Button variant={mode === 'ai' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('ai')}>
              AI Generation
            </Button>
            <Button variant={mode === 'manual' ? 'inverse' : 'outline'} size="sm" onClick={() => setMode('manual')}>
              Manual Builder
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm text-slate-600">
            Course title
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
            <input
              value={form.summary}
              onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
              placeholder="3-week accelerator to master adaptive testing."
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
            />
          </label>
        </div>

        {mode === 'ai' ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-600">
              Target audience
              <input
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                placeholder="University freshmen, aspiring product managers, etc."
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Learning outcomes
              <input
                value={form.goals}
                onChange={(e) => setForm((prev) => ({ ...prev, goals: e.target.value }))}
                placeholder="Build adaptive quizzes, analyze performance dashboards…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600">
              Tone or style
              <input
                value={form.tone}
                onChange={(e) => setForm((prev) => ({ ...prev, tone: e.target.value }))}
                placeholder="Accessible, hands-on, inspiring"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Module count
                <input
                  type="number"
                  min={2}
                  value={form.modulesCount}
                  onChange={(e) => setForm((prev) => ({ ...prev, modulesCount: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
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
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Manual outline builder</h3>
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
          </div>
        )}

        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{error}</div>}

        <Button className="mt-6" onClick={handleSubmit} disabled={!canSubmit || loading}>
          {loading ? 'Generating…' : mode === 'ai' ? 'Generate with AI' : 'Save manual outline'}
        </Button>
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

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recent courses</h3>
        {recentCourses.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No courses created yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
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
    </div>
  );
}
