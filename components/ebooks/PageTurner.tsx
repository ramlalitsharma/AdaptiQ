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
    <div className="flex flex-col gap-8" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="flex flex-wrap items-center justify-between gap-6 px-4">
        <button
          onClick={prev}
          disabled={atStart}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${atStart
            ? 'border-slate-100 dark:border-white/5 text-slate-300 dark:text-slate-700'
            : 'border-slate-200 dark:border-white/10 text-elite-accent-cyan hover:border-elite-accent-cyan/50 hover:bg-elite-accent-cyan/10 active:scale-90 shadow-sm'
            }`}
          title="Previous page"
        >
          <span className="text-xl">←</span>
        </button>

        <div className="flex flex-wrap items-center gap-8">
          <div className="flex flex-col items-center gap-1">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Coordinate</div>
            <div className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-tighter">
              {double ? `${leftPageIndex + 1}–${Math.min(pages.length, rightPageIndex + 1)}` : `${leftPageIndex + 1}`} <span className="text-slate-300 dark:text-slate-600">/</span> {pages.length}
            </div>
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/5 hidden sm:block" />

          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Density</div>
            <input
              type="range"
              min={1000}
              max={3000}
              step={100}
              value={charsPerPage}
              onChange={(e) => setCharsPerPage(Number(e.target.value))}
              className="w-32 h-1 bg-slate-200 dark:bg-white/5 rounded-full appearance-none cursor-pointer accent-elite-accent-cyan"
              aria-label="Page density"
            />
          </div>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-white/5 hidden sm:block" />

          <div className="flex flex-col items-center gap-2">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Typography</div>
            <div className="flex gap-1">
              {(['text-sm', 'text-base', 'text-lg'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-1 rounded-md text-[9px] font-black uppercase transition-all ${fontSize === size
                    ? 'bg-elite-accent-cyan text-white dark:text-black'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  {size.replace('text-', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={next}
          disabled={atEnd}
          className={`h-12 w-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${atEnd
            ? 'border-slate-100 dark:border-white/5 text-slate-300 dark:text-slate-700'
            : 'border-slate-200 dark:border-white/10 text-elite-accent-cyan hover:border-elite-accent-cyan/50 hover:bg-elite-accent-cyan/10 active:scale-90 shadow-sm'
            }`}
          title="Next page"
        >
          <span className="text-xl">→</span>
        </button>
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-b from-black/[0.02] dark:from-white/[0.02] to-transparent pointer-events-none" />
        <div className="min-h-[600px] p-8 sm:p-12 lg:p-16 grid gap-0 lg:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div
              key={leftPageIndex}
              initial={{ rotateY: -12, x: -40, opacity: 0 }}
              animate={{ rotateY: 0, x: 0, opacity: 1 }}
              exit={{ rotateY: 12, x: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              className={`border-r border-slate-200 lg:dark:border-white/5 pr-8 lg:pr-12 ${fontSize} leading-relaxed text-slate-700 dark:text-slate-300 font-medium`}
            >
              <div className="mb-10 flex items-center gap-3">
                <span className="h-4 w-1 bg-elite-accent-cyan rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 truncate">
                  {pages[leftPageIndex]?.title}
                </span>
              </div>
              <div className="space-y-6">
                {pages[leftPageIndex]?.text.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className="first-letter:text-3xl first-letter:font-black first-letter:text-elite-accent-cyan first-letter:mr-1">
                    {para}
                  </p>
                ))}
              </div>
            </motion.div>

            {double && pages[rightPageIndex] && (
              <motion.div
                key={rightPageIndex}
                initial={{ rotateY: 12, x: 40, opacity: 0 }}
                animate={{ rotateY: 0, x: 0, opacity: 1 }}
                exit={{ rotateY: -12, x: -40, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                className={`pl-8 lg:pl-12 ${fontSize} leading-relaxed text-slate-700 dark:text-slate-300 font-medium`}
              >
                <div className="mb-10 flex items-center gap-3">
                  <span className="h-4 w-1 bg-elite-accent-purple rounded-full" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 truncate">
                    {pages[rightPageIndex]?.title}
                  </span>
                </div>
                <div className="space-y-6">
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
