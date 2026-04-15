'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays } from 'date-fns';

interface StreakCalendarProps {
    activityDates: Date[]; // Dates the user studied
    currentStreak: number;
    longestStreak: number;
}

export function StreakCalendar({ activityDates, currentStreak, longestStreak }: StreakCalendarProps) {
    const days = useMemo(() => {
        const end = new Date();
        const start = subDays(end, 20); // Show last 21 days for compact view
        return eachDayOfInterval({ start, end });
    }, []);

    return (
        <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500">
                        <Flame size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Temporal Map</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active nodes: {activityDates.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-xl font-black text-white leading-none">{currentStreak}</div>
                        <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">Current</div>
                    </div>
                    <div className="w-px h-10 bg-white/5" />
                    <div className="text-right">
                        <div className="text-xl font-black text-white leading-none">{longestStreak}</div>
                        <div className="text-[8px] text-slate-500 font-black uppercase tracking-widest mt-1">Record</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-3 mb-8">
                {days.map((day, idx) => {
                    const active = activityDates.some(d => isSameDay(d, day));
                    return (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.01 }}
                            className={`aspect-square rounded-xl flex items-center justify-center relative group border ${active
                                ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                                : 'bg-white/5 border-white/5 text-slate-500'
                                }`}
                        >
                            <span className={`text-[10px] font-black ${active ? 'text-white' : 'text-white/20'}`}>
                                {format(day, 'd')}
                            </span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black/90 border border-white/10 text-white text-[8px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none z-10 backdrop-blur-xl">
                                {format(day, 'MMM dd')} // {active ? 'ACTIVE' : 'OFFLINE'}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-elite-accent-cyan/10 border border-elite-accent-cyan/20 flex items-center justify-center text-elite-accent-cyan">
                    <Trophy size={18} />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                        Maintain <span className="text-white font-black">7x sync rate</span> to unlock <span className="text-elite-accent-cyan font-black">"CONSTANT SYNC"</span> asset
                    </p>
                </div>
            </div>
        </div>
    );
}
