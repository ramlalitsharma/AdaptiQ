'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Question {
  id: string;
  question: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags?: string[];
}

interface QuestionBankSummary {
  id: string;
  name: string;
  subject?: string;
  examType?: string;
}

interface ExamBuilderProps {
  banks: QuestionBankSummary[];
}

export function ExamBuilder({ banks }: ExamBuilderProps) {
  const [selectedBank, setSelectedBank] = useState<string>(banks[0]?.id || '');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    durationMinutes: 60,
    totalMarks: 100,
  });
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadQuestions = async (bankId: string) => {
    if (!bankId) return;
    setLoadingQuestions(true);
    try {
      const res = await fetch(`/api/admin/question-banks/${bankId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load questions');
      setQuestions(data.questions || []);
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Could not load questions');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (selectedBank) {
      loadQuestions(selectedBank);
    }
  }, [selectedBank]);

  const questionCount = useMemo(() => selectedQuestions.length, [selectedQuestions]);

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId],
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (questionCount === 0) {
      alert('Select at least one question');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        questionBankIds: selectedBank ? [selectedBank] : [],
        questionIds: selectedQuestions,
        durationMinutes: form.durationMinutes,
        totalMarks: form.totalMarks,
      };

      const res = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create exam');
      setSelectedQuestions([]);
      setForm({ name: '', description: '', durationMinutes: 60, totalMarks: 100 });
      alert('Exam created successfully');
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Unable to create exam');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,0.9fr),minmax(0,1.1fr)]">
      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-4 p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Exam configuration</h2>
            <p className="text-sm text-slate-500">
              Define exam metadata, duration, and marks. Select a question bank to curate content.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="space-y-1 text-sm text-slate-600 block">
              Exam name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="UPSC Prelims 2025 Practice Test"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600 block">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
              />
            </label>

            <label className="space-y-1 text-sm text-slate-600 block">
              Source question bank
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              >
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} {bank.subject ? `• ${bank.subject}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Duration (minutes)
                <input
                  type="number"
                  min={15}
                  value={form.durationMinutes}
                  onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Total marks
                <input
                  type="number"
                  min={questionCount}
                  value={form.totalMarks}
                  onChange={(e) => setForm((prev) => ({ ...prev, totalMarks: Number(e.target.value) }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                />
              </label>
            </div>

            <div className="text-sm text-slate-500">
              {questionCount} question{questionCount === 1 ? '' : 's'} selected
            </div>

            <Button type="submit" disabled={saving || questionCount === 0}>
              {saving ? 'Saving…' : 'Create exam template'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Select questions</h2>
              <p className="text-sm text-slate-500">Toggle questions to include them in this exam.</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              {questionCount} chosen
            </span>
          </div>

          {loadingQuestions ? (
            <div className="p-10 text-center text-slate-500">Loading questions…</div>
          ) : questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No questions in this bank yet.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {questions.map((question) => {
                const selected = selectedQuestions.includes(question.id);
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => toggleQuestion(question.id)}
                    className={`block w-full rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold">{question.question}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Difficulty: {question.difficulty}
                      {question.tags && question.tags.length > 0 ? ` • ${question.tags.join(', ')}` : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
