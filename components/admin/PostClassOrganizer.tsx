'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

interface PostClassOrganizerProps {
    session: {
        _id: string;
        roomName: string;
        duration: number;
        attendees: string[];
        recordingUrl?: string;
    };
    courseMode: 'curriculum' | 'professional';
    onSave: (data: any) => void;
    onCancel: () => void;
}

export function PostClassOrganizer({ session, courseMode, onSave, onCancel }: PostClassOrganizerProps) {
    const [formData, setFormData] = useState({
        summary: '',
        topicsCovered: [''],
        keyTakeaways: [''],
        // Curriculum mode
        unitId: '',
        chapterId: '',
        lessonId: '',
        // Professional mode
        skillId: '',
        day: 1,
        part: 1,
    });

    const [resources, setResources] = useState<Array<{
        type: 'pdf' | 'code' | 'link' | 'file';
        title: string;
        url: string;
    }>>([]);

    const addTopic = () => {
        setFormData({
            ...formData,
            topicsCovered: [...formData.topicsCovered, ''],
        });
    };

    const updateTopic = (index: number, value: string) => {
        const updated = [...formData.topicsCovered];
        updated[index] = value;
        setFormData({ ...formData, topicsCovered: updated });
    };

    const addTakeaway = () => {
        setFormData({
            ...formData,
            keyTakeaways: [...formData.keyTakeaways, ''],
        });
    };

    const updateTakeaway = (index: number, value: string) => {
        const updated = [...formData.keyTakeaways];
        updated[index] = value;
        setFormData({ ...formData, keyTakeaways: updated });
    };

    const handleSave = () => {
        const organizationData = {
            summary: formData.summary,
            topicsCovered: formData.topicsCovered.filter(t => t.trim()),
            keyTakeaways: formData.keyTakeaways.filter(k => k.trim()),
            resources,
            ...(courseMode === 'curriculum'
                ? {
                    curriculum: {
                        unitId: formData.unitId,
                        chapterId: formData.chapterId,
                        lessonId: formData.lessonId,
                    },
                }
                : {
                    professional: {
                        skillId: formData.skillId,
                        day: formData.day,
                        part: formData.part,
                    },
                }),
        };
        onSave(organizationData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-4xl my-8">
                <CardContent className="p-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-black text-slate-900">Session Completed! 🎉</h2>
                            <Badge className="bg-green-500">Recorded</Badge>
                        </div>
                        <p className="text-slate-600">{session.roomName}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            <span>⏱️ Duration: {Math.floor(session.duration / 60)}h {session.duration % 60}m</span>
                            <span>👥 Attendees: {session.attendees.length} students</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Session Summary */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Session Summary
                            </label>
                            <textarea
                                value={formData.summary}
                                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                placeholder="What did you cover in this session?"
                                rows={4}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2"
                            />
                        </div>

                        {/* Topics Covered */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Topics Covered
                            </label>
                            <div className="space-y-2">
                                {formData.topicsCovered.map((topic, index) => (
                                    <div key={index} className="flex gap-2">
                                        <span className="text-slate-400 pt-2">•</span>
                                        <Input
                                            value={topic}
                                            onChange={(e) => updateTopic(index, e.target.value)}
                                            placeholder="e.g., Variables and data types"
                                            className="flex-1"
                                        />
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addTopic}>
                                    + Add Topic
                                </Button>
                            </div>
                        </div>

                        {/* Key Takeaways */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Key Takeaways
                            </label>
                            <div className="space-y-2">
                                {formData.keyTakeaways.map((takeaway, index) => (
                                    <div key={index} className="flex gap-2">
                                        <span className="text-slate-400 pt-2">💡</span>
                                        <Input
                                            value={takeaway}
                                            onChange={(e) => updateTakeaway(index, e.target.value)}
                                            placeholder="e.g., Always use meaningful variable names"
                                            className="flex-1"
                                        />
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addTakeaway}>
                                    + Add Takeaway
                                </Button>
                            </div>
                        </div>

                        {/* Organization */}
                        <div className="border-t pt-6">
                            <h3 className="font-bold text-slate-900 mb-4">Organize This Session</h3>

                            {courseMode === 'professional' ? (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Skill
                                        </label>
                                        <select
                                            value={formData.skillId}
                                            onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                        >
                                            <option value="">Select Skill</option>
                                            <option value="skill-1">Python Fundamentals</option>
                                            <option value="skill-2">Web Development</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Day
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.day}
                                            onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) })}
                                            min={1}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Part
                                        </label>
                                        <Input
                                            type="number"
                                            value={formData.part}
                                            onChange={(e) => setFormData({ ...formData, part: parseInt(e.target.value) })}
                                            min={1}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Unit
                                        </label>
                                        <select
                                            value={formData.unitId}
                                            onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                        >
                                            <option value="">Select Unit</option>
                                            <option value="unit-1">Unit 1: Introduction</option>
                                            <option value="unit-2">Unit 2: Advanced Topics</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Chapter
                                        </label>
                                        <select
                                            value={formData.chapterId}
                                            onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                        >
                                            <option value="">Select Chapter</option>
                                            <option value="chapter-1">Chapter 1: Getting Started</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Lesson
                                        </label>
                                        <select
                                            value={formData.lessonId}
                                            onChange={(e) => setFormData({ ...formData, lessonId: e.target.value })}
                                            className="w-full rounded-lg border border-slate-200 px-3 py-2"
                                        >
                                            <option value="">Select Lesson</option>
                                            <option value="lesson-1">Lesson 1: Welcome</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <p className="text-sm text-blue-700">
                                    {courseMode === 'professional'
                                        ? `This session will be organized as: Skill → Day ${formData.day} → Part ${formData.part}`
                                        : 'This session will be organized in the selected Unit → Chapter → Lesson'}
                                </p>
                            </div>
                        </div>

                        {/* Resources */}
                        <div className="border-t pt-6">
                            <h3 className="font-bold text-slate-900 mb-4">Attach Resources</h3>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm">📄 Add Slides</Button>
                                <Button variant="outline" size="sm">💻 Add Code</Button>
                                <Button variant="outline" size="sm">🔗 Add Link</Button>
                                <Button variant="outline" size="sm">📁 Add File</Button>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mt-8 pt-6 border-t">
                        <Button onClick={handleSave} className="flex-1 py-6 text-lg font-bold">
                            💾 Save & Organize
                        </Button>
                        <Button variant="outline" onClick={onCancel} className="px-8 py-6">
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
