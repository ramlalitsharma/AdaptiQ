'use client';

import { useEffect, useState } from 'react';

interface SubjectSelectorProps {
  onChange: (selection: { subjectName: string; levelName?: string }) => void;
}

export function SubjectSelector({ onChange }: SubjectSelectorProps) {
  const [subjectName, setSubjectName] = useState('');
  const [levelName, setLevelName] = useState('Basic');

  useEffect(() => {
    onChange({ subjectName, levelName });
  }, [subjectName, levelName]);

  return (
    <div className="grid md:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          value={subjectName}
          onChange={e => setSubjectName(e.target.value)}
          placeholder="e.g., Mathematics, Biology, World History"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          value={levelName}
          onChange={e => setLevelName(e.target.value)}
        >
          <option>Basic</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
      </div>
    </div>
  );
}


