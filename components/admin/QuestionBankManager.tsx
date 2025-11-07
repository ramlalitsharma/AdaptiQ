'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface QuestionBank {
  id?: string;
  name: string;
  description?: string;
  subject?: string;
  examType?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface QuestionBankManagerProps {
  initialBanks: QuestionBank[];
}

export function QuestionBankManager({ initialBanks }: QuestionBankManagerProps) {
  const [banks, setBanks] = useState(initialBanks);
  const [form, setForm] = useState({
    name: '',
    description: '',
    subject: '',
    examType: '',
    tags: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        subject: form.subject,
        examType: form.examType,
        tags: form.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      const res = await fetch('/api/admin/question-banks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create question bank');
      setBanks((prev) => [data.bank, ...prev]);
      setForm({ name: '', description: '', subject: '', examType: '', tags: '' });
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'Could not create question bank');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Question banks</h2>
              <p className="text-sm text-slate-500">Organize reusable questions by subject and exam type.</p>
            </div>
            <span className="text-xs uppercase tracking-wide text-slate-400">{banks.length} bank(s)</span>
          </div>

          <div className="space-y-4">
            {banks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
                No question banks yet. Create your first bank using the form.
              </div>
            ) : (
              banks.map((bank) => (
                <Card key={bank.id} className="border border-slate-200 shadow-sm">
                  <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{bank.name}</h3>
                        {bank.subject && <Badge variant="info">{bank.subject}</Badge>}
                        {bank.examType && <Badge variant="default">{bank.examType}</Badge>}
                      </div>
                      {bank.description && <p className="text-sm text-slate-500">{bank.description}</p>}
                      {bank.tags && bank.tags.length > 0 && (
                        <div className="text-xs text-slate-400">
                          Tags: {bank.tags.join(', ')}
                        </div>
                      )}
                      <div className="text-xs text-slate-400">
                        Updated {bank.updatedAt ? new Date(bank.updatedAt).toLocaleString() : 'recently'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="inverse" size="sm" asChild>
                        <a href={`/admin/questions/${bank.id}`}>Manage Questions</a>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={`/admin/exams?bank=${bank.id}`}>Create Exam</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-xl bg-white">
        <CardContent className="space-y-5 p-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">Create question bank</h2>
            <p className="text-sm text-slate-500">Group questions by subject, exam, or skill area.</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="space-y-1 text-sm text-slate-600 block">
              Bank name
              <input
                required
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="UPSC GS Paper 1"
              />
            </label>
            <label className="space-y-1 text-sm text-slate-600 block">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                rows={3}
                placeholder="Question repository for UPSC general studies practice."
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-1 text-sm text-slate-600">
                Subject
                <input
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="General Studies"
                />
              </label>
              <label className="space-y-1 text-sm text-slate-600">
                Exam type
                <input
                  value={form.examType}
                  onChange={(e) => setForm((prev) => ({ ...prev, examType: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  placeholder="UPSC"
                />
              </label>
            </div>
            <label className="space-y-1 text-sm text-slate-600 block">
              Tags (comma separated)
              <input
                value={form.tags}
                onChange={(e) => setForm((prev) => ({ ...prev, tags: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                placeholder="history, polity"
              />
            </label>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Create bank'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
