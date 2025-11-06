'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdaptiveQuiz } from '@/components/quiz/AdaptiveQuiz';
import { Button } from '@/components/ui/Button';

interface TopicItem {
  _id: string;
  name: string;
  order?: number;
  levelId: string;
}

interface LevelItem {
  id: string;
  name: string;
}

export function SubjectPractice({
  subjectName,
  levels,
  topicsByLevel,
}: {
  subjectName: string;
  levels: LevelItem[];
  topicsByLevel: Record<string, TopicItem[]>;
}) {
  const defaultLevel = levels?.[0]?.id || '';
  const [levelId, setLevelId] = useState<string>(defaultLevel);
  const [levelName, setLevelName] = useState<string>(levels?.[0]?.name || 'Basic');
  const firstTopic = topicsByLevel[levelId]?.[0] || undefined;
  const [chapterId, setChapterId] = useState<string | undefined>(firstTopic?._id);
  const [chapterName, setChapterName] = useState<string | undefined>(firstTopic?.name);

  useEffect(() => {
    const lvl = levels.find((l) => l.id === levelId);
    setLevelName(lvl?.name || 'Basic');
    const first = topicsByLevel[levelId]?.[0];
    setChapterId(first?._id);
    setChapterName(first?.name);
  }, [levelId]);

  useEffect(() => {
    // Persist selection for AdaptiveQuiz and dashboard
    try {
      localStorage.setItem(
        'adaptiq-subject-selection',
        JSON.stringify({ subjectName, levelName, chapterId, chapterName })
      );
      window.dispatchEvent(new Event('adaptiq-selection-updated'));
    } catch {}
  }, [subjectName, levelName, chapterId, chapterName]);

  // Progress per chapter from API
  const [chapterProgress, setChapterProgress] = useState<Record<string, number>>({});
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/progress');
        if (!res.ok) return;
        const rows = await res.json();
        const map: Record<string, { sum: number; count: number }> = {};
        (rows || []).forEach((p: any) => {
          if (p.subject !== subjectName) return;
          const key = `${p.level || ''}::${p.chapterId || p.chapterName || ''}`;
          if (!map[key]) map[key] = { sum: 0, count: 0 };
          map[key].sum += p.score || 0;
          map[key].count += 1;
        });
        const percent: Record<string, number> = {};
        Object.entries(map).forEach(([k, v]) => {
          percent[k] = v.count ? Math.round(v.sum / v.count) : 0;
        });
        setChapterProgress(percent);
      } catch {}
    })();
  }, [subjectName]);

  // Compute level aggregate % from chapterProgress
  const levelPercent: Record<string, number> = useMemo(() => {
    const result: Record<string, number> = {};
    levels.forEach((lvl) => {
      const chapters = topicsByLevel[lvl.id] || [];
      if (!chapters.length) { result[lvl.id] = 0; return; }
      let sum = 0; let count = 0;
      chapters.forEach((t) => {
        const pct = chapterProgress[`${lvl.name || lvl.id}::${t._id}`];
        if (typeof pct === 'number') { sum += pct; count += 1; }
      });
      result[lvl.id] = count ? Math.round(sum / count) : 0;
    });
    return result;
  }, [levels, topicsByLevel, chapterProgress]);

  const LevelList = useMemo(() => (
    <div className="space-y-3">
      {levels.map((lvl) => (
        <div key={lvl.id} className={`rounded-lg border p-3 ${levelId === lvl.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <button
              className="font-medium text-gray-900 text-left"
              onClick={() => setLevelId(lvl.id)}
            >
              {lvl.name}
            </button>
          </div>
          {!!(topicsByLevel[lvl.id] || []).length && (
            <div className="mt-3 space-y-2">
              {(topicsByLevel[lvl.id] || []).map((t) => (
                <button
                  key={t._id}
                  onClick={() => { setChapterId(t._id); setChapterName(t.name); setLevelId(lvl.id); }}
                  className={`w-full text-left px-3 py-2 rounded-md border ${chapterId === t._id ? 'border-blue-500 bg-white' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <div className="text-sm font-medium text-gray-800">{t.name}</div>
                  {t.order ? <div className="text-xs text-gray-500">Chapter {t.order}</div> : null}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${chapterProgress[`${lvl.name || lvl.id}::${t._id}`] || 0}%` }} />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  ), [levels, topicsByLevel, levelId, chapterId]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <aside className="lg:col-span-1">
        <div className="sticky top-24">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Levels & Chapters</h3>
            <p className="text-sm text-gray-600">Choose a level and chapter to focus your practice.</p>
          </div>
          {LevelList}

          {/* Level overview dropdowns */}
          <div className="mt-6 space-y-3">
            {levels.map((lvl) => (
              <details key={`ov-${lvl.id}`} className="rounded-lg border bg-white">
                <summary className="cursor-pointer select-none px-3 py-2 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{lvl.name}</span>
                  <span className="text-xs text-gray-600">{levelPercent[lvl.id] || 0}%</span>
                </summary>
                <div className="px-3 pb-3 space-y-2">
                  {(topicsByLevel[lvl.id] || []).map((t) => (
                    <div key={`ovt-${t._id}`} className="text-sm flex items-center justify-between">
                      <span className="text-gray-700">{t.name}</span>
                      <span className="text-xs text-gray-500">{chapterProgress[`${lvl.name || lvl.id}::${t._id}`] || 0}%</span>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      </aside>
      <section className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{subjectName}</h2>
            <p className="text-sm text-gray-600">{levelName}{chapterName ? ` · ${chapterName}` : ''}</p>
          </div>
          <Button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} variant="outline">Back to Top</Button>
        </div>
        <AdaptiveQuiz topic={subjectName} />
      </section>
    </div>
  );
}


