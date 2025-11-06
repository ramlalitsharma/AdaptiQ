'use client';

import { useEffect, useState } from 'react';

export function Analytics({ subjectName }: { subjectName: string }) {
  const [stats, setStats] = useState<{ avg?: number; total?: number }>({});
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/progress');
        if (!res.ok) return;
        const rows = await res.json();
        const filtered = (rows || []).filter((p: any) => p.subject === subjectName);
        const total = filtered.length;
        const avg = total ? Math.round(filtered.reduce((s: number, p: any) => s + (p.score || 0), 0) / total) : 0;
        setStats({ avg, total });
      } catch {}
    })();
  }, [subjectName]);

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 border rounded-xl bg-white">
        <div className="text-sm text-gray-500">Average Score</div>
        <div className="text-3xl font-bold text-blue-600">{stats.avg ?? 0}%</div>
      </div>
      <div className="p-4 border rounded-xl bg-white">
        <div className="text-sm text-gray-500">Total Quizzes</div>
        <div className="text-3xl font-bold text-green-600">{stats.total ?? 0}</div>
      </div>
      <div className="p-4 border rounded-xl bg-white">
        <div className="text-sm text-gray-500">Time Studied</div>
        <div className="text-3xl font-bold text-purple-600">—</div>
      </div>
    </div>
  );
}


