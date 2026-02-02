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
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-50 rounded-2xl text-rose-600">
                        <Flame size={20} fill="currentColor" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Consistency Map</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Last 21 Days</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-lg font-black text-slate-900 leading-none">{currentStreak}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Current</div>
                    </div>
                    <div className="w-px h-8 bg-slate-100" />
                    <div className="text-right">
                        <div className="text-lg font-black text-slate-900 leading-none">{longestStreak}</div>
                        <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">Best</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => {
                    const active = activityDates.some(d => isSameDay(d, day));
                    return (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.02 }}
                            className={`aspect-square rounded-lg flex items-center justify-center relative group ${active
                                    ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                    : 'bg-slate-50 border border-slate-100'
                                }`}
                        >
                            <span className={`text-[10px] font-black ${active ? 'text-white' : 'text-slate-300'}`}>
                                {format(day, 'd')}
                            </span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[8px] font-black rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                {format(day, 'MMM dd')} - {active ? 'Studied' : 'Rest Day'}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <Trophy size={16} />
                </div>
                <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase tracking-wide">
                    Maintain a <span className="text-indigo-600 font-black">7-day streak</span> to unlock the <span className="text-slate-900 font-black">"Week Warrior"</span> badge!
                </p>
            </div>
        </div>
    );
}
