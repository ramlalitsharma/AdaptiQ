'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface LiveRoomCreatorProps {
    lessonTitle: string;
    onCreateRoom: (
        roomData: {
            roomName: string;
            scheduledDate: string;
            scheduledTime: string;
            duration: number;
        },
        autoStart: boolean
    ) => void;
    onCancel: () => void;
}

export function LiveRoomCreator({ lessonTitle, onCreateRoom, onCancel }: LiveRoomCreatorProps) {
    const [mode, setMode] = useState<'instant' | 'schedule'>('instant');
    const [roomData, setRoomData] = useState({
        roomName: lessonTitle || '',
        scheduledDate: '',
        scheduledTime: '',
        duration: 90,
    });

    const handleCreate = () => {
        if (!roomData.roomName) {
            alert('Please enter a room name');
            return;
        }

        if (mode === 'schedule' && (!roomData.scheduledDate || !roomData.scheduledTime)) {
            alert('Please select date and time');
            return;
        }

        const finalData = {
            ...roomData,
            scheduledDate: mode === 'instant' ? new Date().toISOString().split('T')[0] : roomData.scheduledDate,
            scheduledTime: mode === 'instant' ? new Date().toTimeString().split(' ')[0].substring(0, 5) : roomData.scheduledTime,
        };

        onCreateRoom(finalData, mode === 'instant');
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!mounted) return null;

    return createPortal(
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <CardContent className="p-6 md:p-8">
                    <div className="mb-6">
                        <h2 className="text-2xl font-black text-slate-900 mb-2">Create Live Room</h2>
                        <p className="text-slate-500">Host an interactive session for your students</p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                        <button
                            onClick={() => setMode('instant')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'instant' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            ⚡ Start Now
                        </button>
                        <button
                            onClick={() => setMode('schedule')}
                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'schedule' ? 'bg-white shadow text-teal-600' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            📅 Schedule for Later
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Room Name */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Room Name <span className="text-red-500">*</span>
                            </label>
                            <Input
                                value={roomData.roomName}
                                onChange={(e) => setRoomData({ ...roomData, roomName: e.target.value })}
                                placeholder="e.g., Python Basics - Day 1"
                            />
                        </div>

                        {/* Instant Mode Info */}
                        {mode === 'instant' && (
                            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex gap-3 text-indigo-900">
                                <div className="text-xl">⚡</div>
                                <div className="text-sm">
                                    <span className="font-bold">Ready to go live?</span>
                                    <p className="text-indigo-700 mt-1">
                                        We'll create a Jitsi room immediately. You can join straight away and students will see the "Join Now" button.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Schedule Mode Inputs */}
                        {mode === 'schedule' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={roomData.scheduledDate}
                                        onChange={(e) => setRoomData({ ...roomData, scheduledDate: e.target.value })}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Time <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="time"
                                        value={roomData.scheduledTime}
                                        onChange={(e) => setRoomData({ ...roomData, scheduledTime: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Duration - Only show for scheduled */}
                        {mode === 'schedule' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Duration (minutes)
                                </label>
                                <div className="flex gap-2">
                                    {[60, 90, 120, 180].map((mins) => (
                                        <button
                                            key={mins}
                                            onClick={() => setRoomData({ ...roomData, duration: mins })}
                                            className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${roomData.duration === mins
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-bold'
                                                : 'border-slate-200 hover:border-indigo-200'
                                                }`}
                                        >
                                            {mins} min
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    type="number"
                                    value={roomData.duration || ''}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        setRoomData({ ...roomData, duration: isNaN(val) ? 0 : val });
                                    }}
                                    className="mt-2"
                                    placeholder="Custom duration"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8">
                        <Button onClick={handleCreate} className={`flex-1 py-6 text-lg font-bold ${mode === 'instant' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-teal-600 hover:bg-teal-700'}`}>
                            {mode === 'instant' ? '🚀 Start Class Now' : '📅 Schedule Room'}
                        </Button>
                        <Button variant="outline" onClick={onCancel} className="px-8 py-6">
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>,
        document.body
    );
}
