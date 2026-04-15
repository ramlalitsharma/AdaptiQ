'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Shield, AlertTriangle, User, Clock, FileText, ChevronRight, CheckCircle2, XCircle, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface ProctorSession {
    _id: string;
    userId: string;
    sessionId: string;
    startTime: string;
    lastActivity: string;
    status: 'active' | 'completed';
    eventCounts: Record<string, number>;
    trustScore?: number; // 0-100
}

export default function ProctoringDashboard() {
    const [sessions, setSessions] = useState<ProctorSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            // For now, mocking since we just created the API
            // In a real scenario, this would be a GET api/admin/proctoring
            const mockSessions: ProctorSession[] = [
                {
                    _id: '1',
                    userId: 'user_123',
                    sessionId: 'quiz-math-1705646400000',
                    startTime: new Date(Date.now() - 3600000).toISOString(),
                    lastActivity: new Date().toISOString(),
                    status: 'active',
                    eventCounts: { tab_switch: 2, focus_loss: 1 },
                    trustScore: 85
                },
                {
                    _id: '2',
                    userId: 'user_456',
                    sessionId: 'exam-sat-1705642800000',
                    startTime: new Date(Date.now() - 7200000).toISOString(),
                    lastActivity: new Date(Date.now() - 4000000).toISOString(),
                    status: 'completed',
                    eventCounts: { tab_switch: 0, focus_loss: 0 },
                    trustScore: 100
                }
            ];
            setSessions(mockSessions);
        } catch (error) {
            console.error('Failed to fetch proctoring sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
        return 'text-red-600 bg-red-50 border-red-100';
    };

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Shield className="text-rose-600 w-8 h-8" /> Academic Integrity Center
                    </h1>
                    <p className="text-slate-500 font-medium">Monitor and audit student behavior during exams and quizzes.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 ring-rose-500/10 focus:border-rose-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" className="rounded-xl border-slate-200">
                        <Filter size={16} /> Filters
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-lg bg-white rounded-3xl p-6 border-l-4 border-emerald-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900">98%</div>
                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Avg. Trust Score</div>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-lg bg-white rounded-3xl p-6 border-l-4 border-amber-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900">12</div>
                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Flagged Events</div>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-lg bg-white rounded-3xl p-6 border-l-4 border-rose-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                            <Shield size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900">42</div>
                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active Sessions</div>
                        </div>
                    </div>
                </Card>
                <Card className="border-none shadow-lg bg-white rounded-3xl p-6 border-l-4 border-indigo-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900">2.4k</div>
                            <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Total Audits</div>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">Recent Proctoring Sessions</h2>
                    <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-slate-50">View Analytics →</Button>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-8 py-4">Session Info</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Flags</th>
                                    <th className="px-8 py-4">Trust Score</th>
                                    <th className="px-8 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {sessions.map((session) => (
                                    <tr key={session._id} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 uppercase tracking-tighter">{session.userId}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Basic Plan</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div>
                                                <div className="text-sm font-bold text-slate-700">{session.sessionId.split('-')[1].toUpperCase()} QUIZ</div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold mt-1">
                                                    <Clock size={12} /> {format(new Date(session.startTime), 'MMM dd, HH:mm')}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <Badge className={session.status === 'active' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}>
                                                {session.status.toUpperCase()}
                                            </Badge>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-2">
                                                {Object.entries(session.eventCounts).map(([event, count]) => (
                                                    <Badge key={event} variant="outline" className="text-[10px] font-black border-slate-200">
                                                        {event.split('_')[1]}: {count}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`px-3 py-1 rounded-full border text-xs font-black inline-flex items-center gap-1.5 ${getScoreColor(session.trustScore || 0)}`}>
                                                {session.trustScore}% <span className="text-[8px] opacity-60">SCORE</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all text-slate-400 hover:text-rose-600">
                                                <ChevronRight size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[2rem] p-8 overflow-hidden relative">
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-black tracking-widest uppercase">
                            AI Integrity Engine
                        </div>
                        <h3 className="text-2xl font-black">Behavioral Analysis Mode</h3>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-md">
                            AdaptiQ AI analyzes patterns like click speed, tab switch frequency, and focus duration to build a multidimensional integrity profile.
                        </p>
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-black text-xs uppercase tracking-widest px-8">
                            Configure Heuristics
                        </Button>
                    </div>
                    <Shield className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
                </Card>

                <Card className="border-none shadow-xl bg-indigo-600 text-white rounded-[2rem] p-8 overflow-hidden relative">
                    <div className="relative z-10 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white text-xs font-black tracking-widest uppercase">
                            New Feature
                        </div>
                        <h3 className="text-2xl font-black">Provisional Certificates</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed max-w-md">
                            Enable automatic certificate blocking for sessions with trust scores below 80% to ensure true academic merit.
                        </p>
                        <Button className="bg-indigo-900/50 text-white hover:bg-indigo-900 rounded-xl font-black text-xs uppercase tracking-widest px-8 border border-white/20">
                            Enable Gatekeeper
                        </Button>
                    </div>
                    <FileText className="absolute -bottom-10 -right-10 w-64 h-64 text-white/5" />
                </Card>
            </div>
        </div>
    );
}
