'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';

interface LessonEditorProps {
    lesson: {
        title: string;
        contentType?: string;
        videoUrl?: string;
        content?: string;
        documentUrl?: string;
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
                                <textarea
                                    value={lesson.content || ''}
                                    onChange={(e) => onChange('content', e.target.value)}
                                    placeholder="Write your lesson content here... (Markdown supported)"
                                    rows={10}
                                    className="w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
                                />
                                <p className="text-xs text-slate-500">Supports Markdown formatting</p>
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
