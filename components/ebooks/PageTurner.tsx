'use client';

import { useMemo, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Chapter {
  title: string;
  content?: string;
  summary?: string;
}

interface PageTurnerProps {
  chapters: Chapter[];
  approxCharsPerPage?: number;
}

export function PageTurner({ chapters, approxCharsPerPage = 1400 }: PageTurnerProps) {
  const [charsPerPage, setCharsPerPage] = useState<number>(approxCharsPerPage);
  const [double, setDouble] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'text-sm' | 'text-base' | 'text-lg'>('text-base');
  const pages = useMemo(() => {
    const result: { title: string; text: string }[] = [];
    for (const ch of chapters) {
      const base = typeof ch.content === 'string' && ch.content.trim().length > 0 ? ch.content : (ch.summary || '');
      const text = base.trim();
      if (!text) continue;
      const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      let buf = '';
      for (const p of paras) {
        if ((buf + '\n\n' + p).length >= charsPerPage && buf.length > 0) {
          result.push({ title: ch.title, text: buf.trim() });
          buf = p;
        } else {
          buf = buf ? buf + '\n\n' + p : p;
        }
      }
      if (buf.length) {
        result.push({ title: ch.title, text: buf.trim() });
      }
    }
    if (result.length === 0) {
      result.push({ title: 'Page', text: 'No content available.' });
    }
    return result;
  }, [chapters, charsPerPage]);

  const [index, setIndex] = useState(0);

  const step = double ? 2 : 1;
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - step)), [step]);
  const next = useCallback(() => setIndex((i) => Math.min(pages.length - step, i + step)), [pages.length, step]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next]);

  useEffect(() => {
    const apply = () => {
      const w = window.innerWidth;
      setDouble(w >= 1024);
      setCharsPerPage(w >= 1280 ? approxCharsPerPage : w >= 768 ? Math.floor(approxCharsPerPage * 0.8) : Math.floor(approxCharsPerPage * 0.6));
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [approxCharsPerPage]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchStartX(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (dx > 40) prev();
    if (dx < -40) next();
    setTouchStartX(null);
  };

  const leftPageIndex = double ? Math.max(0, index % 2 === 0 ? index : index - 1) : index;
  const rightPageIndex = double ? Math.min(pages.length - 1, leftPageIndex + 1) : leftPageIndex;
  const atStart = leftPageIndex === 0;
  const atEnd = rightPageIndex >= pages.length - 1;

  return (
    <div className="flex flex-col gap-4" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-between">
        <button
          onClick={prev}
          disabled={atStart}
          className={`h-10 w-10 rounded-full flex items-center justify-center border transition ${
            atStart ? 'border-slate-200 text-slate-300' : 'border-rose-400 text-rose-600 hover:bg-rose-50'
          }`}
          title="Previous page"
        >
          ‹
        </button>
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-slate-600">
            {double ? `${leftPageIndex + 1}–${Math.min(pages.length, rightPageIndex + 1)}` : `${leftPageIndex + 1}`} / {pages.length}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={1000}
              max={3000}
              step={100}
              value={charsPerPage}
              onChange={(e) => setCharsPerPage(Number(e.target.value))}
              className="w-40"
              aria-label="Page size"
            />
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value as typeof fontSize)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
              aria-label="Typography"
            >
              <option value="text-sm">Small</option>
              <option value="text-base">Medium</option>
              <option value="text-lg">Large</option>
            </select>
          </div>
        </div>
        <button
          onClick={next}
          disabled={atEnd}
          className={`h-10 w-10 rounded-full flex items-center justify-center border transition ${
            atEnd ? 'border-slate-200 text-slate-300' : 'border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
          title="Next page"
        >
          ›
        </button>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="min-h-[480px] p-4 sm:p-6 lg:p-8 grid gap-0 lg:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={leftPageIndex}
              initial={{ rotateY: -12, x: -40, opacity: 0.2 }}
              animate={{ rotateY: 0, x: 0, opacity: 1 }}
              exit={{ rotateY: 12, x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className="border-r lg:border-slate-200 pr-4 lg:pr-6"
            >
              <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {pages[leftPageIndex]?.title}
              </div>
              <div className={`prose max-w-none text-slate-800 ${fontSize}`}>
                {pages[leftPageIndex]?.text.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </motion.div>
            {double && pages[rightPageIndex] && (
              <motion.div
                key={rightPageIndex}
                initial={{ rotateY: 12, x: 40, opacity: 0.2 }}
                animate={{ rotateY: 0, x: 0, opacity: 1 }}
                exit={{ rotateY: -12, x: -40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className="pl-4 lg:pl-6"
              >
                <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {pages[rightPageIndex]?.title}
                </div>
                <div className={`prose max-w-none text-slate-800 ${fontSize}`}>
                  {pages[rightPageIndex]?.text.split(/\n{2,}/).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
