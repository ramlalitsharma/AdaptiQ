'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Pin, PinOff } from 'lucide-react';

interface TranscriptLine {
    time: number;
    text: string;
}

interface InteractiveTranscriptProps {
    transcript: TranscriptLine[];
    currentTime: number;
    onSeek: (time: number) => void;
    isLoading?: boolean;
}

export function InteractiveTranscript({
    transcript,
    currentTime,
    onSeek,
    isLoading = false
}: InteractiveTranscriptProps) {
    const [search, setSearch] = useState('');
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const activeLineRef = useRef<HTMLButtonElement>(null);

    // Auto-scroll logic
    useEffect(() => {
        if (autoScroll && activeLineRef.current && scrollRef.current) {
            activeLineRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [currentTime, autoScroll]);

    const filteredTranscript = transcript.filter(line =>
        line.text.toLowerCase().includes(search.toLowerCase())
    );

    const isActive = (time: number, index: number) => {
        const nextTime = transcript[index + 1]?.time || Infinity;
        return currentTime >= time && currentTime < nextTime;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-l border-slate-200 overflow-hidden">
            <div className="p-4 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center gap-2">
                        Interactive Transcript
                    </h3>
                    <button
                        onClick={() => setAutoScroll(!autoScroll)}
                        className={`p-1.5 rounded-lg transition-colors ${autoScroll ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:text-slate-600'}`}
                        title={autoScroll ? "Auto-scroll On" : "Auto-scroll Off"}
                    >
                        {autoScroll ? <Pin size={14} /> : <PinOff size={14} />}
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search transcript..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                        <p className="text-sm">Analyzing lecture audio...</p>
                    </div>
                ) : filteredTranscript.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 text-sm italic">
                        No matching lines found.
                    </div>
                ) : (
                    filteredTranscript.map((line, idx) => {
                        const active = isActive(line.time, idx);
                        return (
                            <button
                                key={idx}
                                ref={active ? activeLineRef : null}
                                onClick={() => onSeek(line.time)}
                                className={`w-full text-left p-3 rounded-xl transition-all group flex gap-3 ${active
                                        ? 'bg-white shadow-md border border-indigo-100 ring-4 ring-indigo-500/5'
                                        : 'hover:bg-white/50 border border-transparent'
                                    }`}
                            >
                                <span className={`text-[10px] font-mono font-black shrink-0 mt-1 ${active ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {formatTime(line.time)}
                                </span>
                                <span className={`text-sm leading-relaxed ${active ? 'text-slate-900 font-bold' : 'text-slate-600'}`}>
                                    {line.text}
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}
