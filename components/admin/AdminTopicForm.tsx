'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export function AdminTopicForm({ onCreated }: { onCreated?: () => void }) {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectId, setSubjectId] = useState('');
  const [levels, setLevels] = useState<any[]>([]);
  const [levelId, setLevelId] = useState('');
  const [name, setName] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/subjects');
      const data = res.ok ? await res.json() : [];
      setSubjects(data);
    })();
  }, []);

  useEffect(() => {
    const subj = subjects.find(s => s._id === subjectId);
    setLevels(subj?.levels || []);
    setLevelId('');
  }, [subjectId, subjects]);

  const handleSubmit = async () => {
    if (!subjectId || !levelId || !name.trim()) return;
    setLoading(true);
    try {
      const payload = { subjectId, levelId, name: name.trim(), order };
      const res = await fetch('/api/topics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setName('');
        setOrder(1);
        onCreated?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <select className="w-full px-3 py-2 border rounded-lg" value={subjectId} onChange={e => setSubjectId(e.target.value)}>
          <option value="">Select a subject</option>
          {subjects.map(s => (
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
        <select className="w-full px-3 py-2 border rounded-lg" value={levelId} onChange={e => setLevelId(e.target.value)} disabled={!levels.length}>
          <option value="">{levels.length ? 'Select a level' : 'No levels'}</option>
          {levels.map((l: any) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chapter name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Algebra Basics" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
          <input type="number" value={order} onChange={e => setOrder(Number(e.target.value))} className="w-full px-3 py-2 border rounded-lg" min={1} />
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={loading} disabled={!subjectId || !levelId || !name.trim()}>Create Chapter</Button>
      </div>
    </div>
  );
}


