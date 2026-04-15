'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Loader2, TrendingUp, Users, Award, PlayCircle } from 'lucide-react';

interface EngagementData {
    stats: {
        totalEnrollments: number;
        totalCompletions: number;
        averageEngagement: number;
    };
    engagementData: Array<{ day: string; value: number }>;
    topCourses: Array<{ title: string; engagement: number; students: number }>;
}

export function EngagementAnalytics() {
    const [data, setData] = useState<EngagementData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/admin/analytics/engagement');
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error('Failed to fetch analytics:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;
    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500 rounded-2xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Active Students</p>
                                <h4 className="text-2xl font-black text-slate-900">{data.stats.totalEnrollments}</h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-500 rounded-2xl">
                                <Award className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Certificates Issued</p>
                                <h4 className="text-2xl font-black text-slate-900">{data.stats.totalCompletions}</h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg. Engagement</p>
                                <h4 className="text-2xl font-black text-slate-900">{data.stats.averageEngagement}%</h4>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Weekly Engagement Heatmap */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-black flex items-center gap-2">
                            <PlayCircle className="w-5 h-5 text-blue-500" />
                            Weekly Learning Flux
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end justify-between h-48 gap-2 px-2">
                            {data.engagementData.map((d) => (
                                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div
                                        className="w-full bg-blue-100 rounded-t-lg transition-all group-hover:bg-blue-500 relative"
                                        style={{ height: `${d.value}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {d.value}%
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Courses */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg font-black">Performance Leaderboard</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {data.topCourses.map((course, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="text-sm font-bold text-slate-900 truncate">{course.title}</p>
                                        <p className="text-[10px] text-slate-500 font-mono">{course.students} active students</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500" style={{ width: `${course.engagement}%` }}></div>
                                        </div>
                                        <span className="text-xs font-black text-slate-700">{course.engagement}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
