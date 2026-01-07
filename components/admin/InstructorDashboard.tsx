'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface LiveClass {
    _id: string;
    roomId: string;
    roomName: string;
    courseId: string;
    courseTitle?: string;
    scheduledTime: string;
    duration: number;
    status: 'scheduled' | 'live' | 'ended';
    attendees: string[];
}

export function InstructorDashboard() {
    const [upcomingClasses, setUpcomingClasses] = useState<LiveClass[]>([]);
    const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        try {
            const res = await fetch('/api/live/instructor/classes');
            if (res.ok) {
                const data = await res.json();
                setUpcomingClasses(data.upcoming || []);
                setLiveClasses(data.live || []);
            }
        } catch (error) {
            console.error('Failed to load classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartClass = async (roomId: string) => {
        try {
            const res = await fetch(`/api/live/rooms/${roomId}/start`, {
                method: 'POST',
            });

            if (res.ok) {
                const data = await res.json();
                // Open Jitsi room in new window
                window.open(data.roomUrl, '_blank', 'width=1200,height=800');
                await loadClasses();
            }
        } catch (error) {
            console.error('Failed to start class:', error);
        }
    };

    const formatDateTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let dayLabel = '';
        if (date.toDateString() === today.toDateString()) {
            dayLabel = 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            dayLabel = 'Tomorrow';
        } else {
            dayLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        }

        const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        return { dayLabel, time };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="text-slate-500">Loading classes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Live Now */}
            {liveClasses.length > 0 && (
                <div>
                    <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                        <span className="flex h-3 w-3 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]"></span>
                        Live Now
                    </h2>
                    <div className="grid gap-4">
                        {liveClasses.map((cls) => {
                            const { dayLabel, time } = formatDateTime(cls.scheduledTime);
                            return (
                                <Card key={cls._id} className="border-2 border-red-500 bg-red-50">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-black text-slate-900">{cls.roomName}</h3>
                                                    <Badge className="bg-red-500">LIVE</Badge>
                                                </div>
                                                {cls.courseTitle && (
                                                    <p className="text-sm text-slate-600 mb-2">Course: {cls.courseTitle}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                                    <span>👥 {cls.attendees.length} students</span>
                                                    <span>⏱️ {cls.duration} min</span>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() => window.open(`/live/room/${cls.roomId}`, '_blank')}
                                                className="bg-red-500 hover:bg-red-600"
                                            >
                                                Join Class
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Upcoming Classes */}
            <div>
                <h2 className="text-xl font-black text-slate-900 mb-4">Upcoming Classes</h2>
                {upcomingClasses.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <div className="text-4xl mb-3">📅</div>
                            <p className="text-slate-500">No upcoming classes scheduled</p>
                            <p className="text-sm text-slate-400 mt-1">Create a live course to get started</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {upcomingClasses.map((cls) => {
                            const { dayLabel, time } = formatDateTime(cls.scheduledTime);
                            const scheduledDate = new Date(cls.scheduledTime);
                            const now = new Date();
                            const canStart = scheduledDate <= now;

                            return (
                                <Card key={cls._id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-black text-slate-900 mb-2">{cls.roomName}</h3>
                                                {cls.courseTitle && (
                                                    <p className="text-sm text-slate-600 mb-3">Course: {cls.courseTitle}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm">
                                                    <span className="flex items-center gap-1 text-indigo-600 font-medium">
                                                        📅 {dayLabel}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-600">
                                                        ⏰ {time}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        ⏱️ {cls.duration} min
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {canStart ? (
                                                    <Button
                                                        onClick={() => handleStartClass(cls.roomId)}
                                                        className="bg-indigo-500 hover:bg-indigo-600"
                                                    >
                                                        🎥 Start Class
                                                    </Button>
                                                ) : (
                                                    <Button variant="outline" disabled>
                                                        Scheduled
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
