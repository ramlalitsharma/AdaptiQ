'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Question {
  id?: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: Array<{ id: string; text: string; correct?: boolean }>;
  answerExplanation?: string;
  tags?: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  createdAt?: string;
}

interface QuestionEditorProps {
  bankId: string;
  initialQuestions: Question[];
}

const difficultyLabel = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function QuestionEditor({ bankId, initialQuestions }: QuestionEditorProps) {
  const [questions, setQuestions] = useState(initialQuestions);
  const [form, setForm] = useState({
    question: '',
    type: 'multiple-choice' as Question['type'],
    options: [
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
      { id: crypto.randomUUID(), text: '', correct: false },
    ],
    answerExplanation: '',
    tags: '',
    difficulty: 'medium' as Question['difficulty'],
  });
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setForm({
      question: '',
      type: 'multiple-choice',
      options: [
        { id: crypto.randomUUID(), text: '', correct: false },
        { id: crypto.randomUUID(), text: '', correct: false },
        { id: crypto.randomUUID(), text: '', correct: false },
        { id: crypto.randomUUID(), text: '', correct: false },
      ],
      answerExplanation: '',
      tags: '',
      difficulty: 'medium',
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        question: form.question,
        type: form.type,
        options: form.type === 'multiple-choice' ? form.options : [],
        answerExplanation: form.answerExplanation,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
        difficulty: form.difficulty,
      };

      const res = await fetch(`/api/admin/question-banks/${bankId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add question');
      setQuestions((prev) => [data.question, ...prev]);
      resetForm();
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Could not add question');
    } finally {
      setSaving(false);
    }
  };

  const toggleCorrect = (optionId: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === optionId ? { ...option, correct: !option.correct } : option,
      ),
    }));
  };

  const updateOptionText = (optionId: string, text: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((option) =>
        option.id === optionId ? { ...option, text } : option,
      ),
    }));
  };

  const deleteQuestion = async (questionId?: string) => {
    if (!questionId) return;
    if (!confirm('Delete this question?')) return;
    try {
      const res = await fetch(`/api/admin/question-banks/${bankId}/questions/${questionId}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to delete question');
      setQuestions((prev) => prev.filter((question) => question.id !== questionId));
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Unable to delete question');
    }
  };

  return (
    <div className="space-y-8">
      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Add question</h2>
            <p className="text-sm text-slate-500">Author new questions with structured metadata.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="space-y-1 text-sm text-slate-600 block">
              Question prompt
              <textarea
                required
                value={form.question}
                onChange={(e) => setForm((prev) => ({ ...prev, question: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
                placeholder="What is the capital of Nepal?"
              />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Question type
                <select
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as Question['type'] }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="true-false">True / False</option>
                  <option value="short-answer">Short Answer</option>
                </select>
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Difficulty
                <select
                  value={form.difficulty}
                  onChange={(e) => setForm((prev) => ({ ...prev, difficulty: e.target.value as Question['difficulty'] }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </label>
            </div>

            {form.type === 'multiple-choice' && (
              <div className="space-y-3">
                <div className="text-sm font-medium text-slate-600">Options</div>
                {form.options.map((option) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <input
                      value={option.text}
                      onChange={(e) => updateOptionText(option.id, e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
                      placeholder="Option text"
                    />
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={Boolean(option.correct)}
                        onChange={() => toggleCorrect(option.id)}
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>
            )}

            <label className="space-y-1 text-sm text-slate-600 block">
              Explanation (optional)
              <textarea
                value={form.answerExplanation}
                onChange={(e) => setForm((prev) => ({ ...prev, answerExplanation: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={2}
              />
            </label>

            <label className="space-y-1 text-sm text-slate-600 block">
              Tags (comma separated)
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="geography, capitals"
              />
            </label>

            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Add question'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Question library</h2>
              <p className="text-sm text-slate-500">Manage authored questions and export for exams.</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-slate-400">{questions.length} items</span>
          </div>

          {questions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
              No questions yet. Use the form above to add your first question.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <Card key={question.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm uppercase tracking-wide text-slate-400">
                          {question.type.replace('-', ' ')} • {difficultyLabel[question.difficulty]}
                        </div>
                        <div className="text-base font-semibold text-slate-900">{question.question}</div>
                        {question.tags && question.tags.length > 0 && (
                          <div className="text-xs text-slate-400 mt-2">Tags: {question.tags.join(', ')}</div>
                        )}
                        {question.answerExplanation && (
                          <div className="text-xs text-slate-500 mt-2">Explanation: {question.answerExplanation}</div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => deleteQuestion(question.id)}>
                        Delete
                      </Button>
                    </div>

                    {question.options && question.options.length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                        {question.options.map((option) => (
                          <li key={option.id} className={option.correct ? 'font-semibold text-emerald-600' : ''}>
                            {option.text} {option.correct ? '(Correct)' : ''}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
