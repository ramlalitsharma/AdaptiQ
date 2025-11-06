'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function AdminSubjectForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('academic');
  const [levels, setLevels] = useState<Array<{ id: string; name: string }>>([
    { id: 'basic', name: 'Basic' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ]);
  const [loading, setLoading] = useState(false);

  const handleAddLevel = () => {
    setLevels([...levels, { id: `level-${levels.length + 1}`, name: `Level ${levels.length + 1}` }]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: '',
        icon: '📚',
        color: 'blue',
        category,
        levels,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      const res = await fetch('/api/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        setName('');
        onCreated?.();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border rounded-lg" placeholder="e.g., Mathematics" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
          <option value="academic">Academic</option>
          <option value="professional">Professional</option>
          <option value="language">Language</option>
          <option value="test-prep">Test Prep</option>
          <option value="iq-cognitive">IQ/Cognitive</option>
        </select>
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Levels</label>
          <button onClick={handleAddLevel} className="text-blue-600 text-sm">+ Add Level</button>
        </div>
        <div className="space-y-2">
          {levels.map((lvl, idx) => (
            <div key={idx} className="grid grid-cols-2 gap-2">
              <input value={lvl.id} onChange={e => {
                const v = [...levels]; v[idx] = { ...v[idx], id: e.target.value }; setLevels(v);
              }} className="px-3 py-2 border rounded-lg" placeholder="level id" />
              <input value={lvl.name} onChange={e => {
                const v = [...levels]; v[idx] = { ...v[idx], name: e.target.value }; setLevels(v);
              }} className="px-3 py-2 border rounded-lg" placeholder="Level name" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit} isLoading={loading} disabled={!name.trim()}>Create Subject</Button>
      </div>
    </div>
  );
}


