'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { TipTapEditor } from '@/components/editor/TipTapEditor';

interface LessonEditorProps {
    lesson: {
        title: string;
        contentType?: string;
        videoUrl?: string;
        content?: string;
        documentUrl?: string;
        videoChapters?: Array<{ title: string; time: number }>;
    };
    onChange: (field: string, value: any) => void;
    onClose: () => void;
}

export function LessonContentEditor({ lesson, onChange, onClose }: LessonEditorProps) {
    const [contentType, setContentType] = useState(lesson.contentType || 'video-upload');

    const handleContentTypeChange = (type: string) => {
        setContentType(type);
        onChange('contentType', type);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black text-slate-900">Edit Lesson Content</h3>
                        <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
                    </div>

                    {/* Lesson Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Lesson Title</label>
                        <Input
                            value={lesson.title}
                            onChange={(e) => onChange('title', e.target.value)}
                            placeholder="e.g., Introduction to Python"
                        />
                    </div>

                    {/* Content Type Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-slate-700 mb-3">Content Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            <button
                                onClick={() => handleContentTypeChange('video-upload')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${contentType === 'video-upload'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 hover:border-blue-200'
                                    }`}
                            >
                                <div className="text-2xl mb-2">📤</div>
                                <div className="font-bold text-sm">Video Upload</div>
                                <div className="text-xs text-slate-500">Upload MP4/MOV</div>
                            </button>

                            <button
                                onClick={() => handleContentTypeChange('video-link')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${contentType === 'video-link'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 hover:border-blue-200'
                                    }`}
                            >
                                <div className="text-2xl mb-2">🔗</div>
                                <div className="font-bold text-sm">Video Link</div>
                                <div className="text-xs text-slate-500">YouTube, Vimeo</div>
                            </button>

                            <button
                                onClick={() => handleContentTypeChange('live-stream')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${contentType === 'live-stream'
                                    ? 'border-indigo-500 bg-indigo-50'
                                    : 'border-slate-200 hover:border-indigo-200'
                                    }`}
                            >
                                <div className="text-2xl mb-2">🎥</div>
                                <div className="font-bold text-sm">Live Stream</div>
                                <div className="text-xs text-slate-500">Scheduled session</div>
                            </button>

                            <button
                                onClick={() => handleContentTypeChange('text-entry')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${contentType === 'text-entry'
                                    ? 'border-emerald-500 bg-emerald-50'
                                    : 'border-slate-200 hover:border-emerald-200'
                                    }`}
                            >
                                <div className="text-2xl mb-2">📝</div>
                                <div className="font-bold text-sm">Text Entry</div>
                                <div className="text-xs text-slate-500">Rich text content</div>
                            </button>

                            <button
                                onClick={() => handleContentTypeChange('pdf-doc')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${contentType === 'pdf-doc'
                                    ? 'border-amber-500 bg-amber-50'
                                    : 'border-slate-200 hover:border-amber-200'
                                    }`}
                            >
                                <div className="text-2xl mb-2">📄</div>
                                <div className="font-bold text-sm">PDF / Doc</div>
                                <div className="text-xs text-slate-500">Upload document</div>
                            </button>

                            <button
                                onClick={() => handleContentTypeChange('interactive-quiz')}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${contentType === 'interactive-quiz'
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-slate-200 hover:border-purple-200'
                                    }`}
                            >
                                <div className="text-2xl mb-2">❓</div>
                                <div className="font-bold text-sm">Interactive Quiz</div>
                                <div className="text-xs text-slate-500">Test knowledge</div>
                            </button>
                        </div>
                    </div>

                    {/* Content Input Based on Type */}
                    <div className="mb-6">
                        {contentType === 'video-upload' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">Upload Video</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                    <div className="text-4xl mb-3">📤</div>
                                    <div className="font-bold text-slate-700 mb-1">Drag & Drop Video</div>
                                    <div className="text-sm text-slate-500 mb-3">or click to browse</div>
                                    <input type="file" accept="video/*" className="hidden" />
                                    <Button variant="outline">Browse Files</Button>
                                </div>
                                <p className="text-xs text-slate-500">Supported: MP4, MOV, AVI (Max 2GB)</p>
                            </div>
                        )}

                        {contentType === 'video-link' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">Video URL</label>
                                <Input
                                    value={lesson.videoUrl || ''}
                                    onChange={(e) => onChange('videoUrl', e.target.value)}
                                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                                />
                                <p className="text-xs text-slate-500">
                                    Paste a YouTube, Vimeo, or direct video link (HLS/m3u8 supported)
                                </p>
                            </div>
                        )}

                        {/* Video Chapters Editor */}
                        {(contentType === 'video-upload' || contentType === 'video-link') && (
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h4 className="font-bold text-slate-900">Video Chapters</h4>
                                        <p className="text-xs text-slate-500">Help students navigate through specific topics in your video.</p>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            const current = lesson.videoChapters || [];
                                            onChange('videoChapters', [...current, { title: '', time: 0 }]);
                                        }}
                                    >
                                        + Add Chapter
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {(lesson.videoChapters || []).map((chapter, idx) => (
                                        <div key={idx} className="flex gap-3 items-start group">
                                            <div className="flex-1">
                                                <Input
                                                    value={chapter.title}
                                                    onChange={(e) => {
                                                        const newChapters = [...(lesson.videoChapters || [])];
                                                        newChapters[idx].title = e.target.value;
                                                        onChange('videoChapters', newChapters);
                                                    }}
                                                    placeholder="Chapter Title (e.g., Introduction)"
                                                    className="h-9"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <Input
                                                    type="number"
                                                    value={chapter.time}
                                                    onChange={(e) => {
                                                        const newChapters = [...(lesson.videoChapters || [])];
                                                        newChapters[idx].time = parseInt(e.target.value) || 0;
                                                        onChange('videoChapters', newChapters);
                                                    }}
                                                    placeholder="Sec"
                                                    className="h-9"
                                                />
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => {
                                                    const newChapters = (lesson.videoChapters || []).filter((_, i) => i !== idx);
                                                    onChange('videoChapters', newChapters);
                                                }}
                                            >
                                                ✕
                                            </Button>
                                        </div>
                                    ))}

                                    {(!lesson.videoChapters || lesson.videoChapters.length === 0) && (
                                        <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                                            <p className="text-sm text-slate-400">No chapters defined yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {contentType === 'live-stream' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">Live Session Details</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Date</label>
                                        <Input type="date" />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-slate-600 mb-1">Time</label>
                                        <Input type="time" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs text-slate-600 mb-1">Duration (minutes)</label>
                                    <Input type="number" placeholder="60" />
                                </div>
                            </div>
                        )}

                        {contentType === 'text-entry' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">Lesson Content</label>
                                <TipTapEditor
                                    value={lesson.content || ''}
                                    onChange={(next) => onChange('content', next)}
                                    height={300}
                                    placeholder="Write your lesson content here..."
                                />
                                <p className="text-xs text-slate-500">Rich text editor enabled</p>
                            </div>
                        )}

                        {contentType === 'pdf-doc' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">Upload Document</label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer">
                                    <div className="text-4xl mb-3">📄</div>
                                    <div className="font-bold text-slate-700 mb-1">Drag & Drop Document</div>
                                    <div className="text-sm text-slate-500 mb-3">or click to browse</div>
                                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" />
                                    <Button variant="outline">Browse Files</Button>
                                </div>
                                <p className="text-xs text-slate-500">Supported: PDF, DOC, DOCX, PPT, PPTX (Max 50MB)</p>
                            </div>
                        )}

                        {contentType === 'interactive-quiz' && (
                            <div className="space-y-4">
                                <label className="block text-sm font-medium text-slate-700">Quiz Configuration</label>
                                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="text-2xl">❓</div>
                                        <div>
                                            <div className="font-bold text-slate-900">Quiz Builder</div>
                                            <div className="text-sm text-slate-600">Create interactive assessments</div>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full">
                                        Open Quiz Builder
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button onClick={onClose} className="flex-1">
                            Save Lesson
                        </Button>
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
