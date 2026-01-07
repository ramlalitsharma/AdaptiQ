'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface CourseModeSelectProps {
    onSelect: (mode: 'curriculum' | 'professional') => void;
    onCancel: () => void;
}

export function CourseModeSelector({ onSelect, onCancel }: CourseModeSelectProps) {
    const [selectedMode, setSelectedMode] = useState<'curriculum' | 'professional' | null>(null);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-4xl">
                <CardContent className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-slate-900 mb-2">Choose Your Course Type</h2>
                        <p className="text-slate-500 text-lg">Select the learning approach that best fits your content</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        {/* Curriculum-Based Option */}
                        <button
                            onClick={() => setSelectedMode('curriculum')}
                            className={`group relative p-8 rounded-2xl border-2 transition-all text-left ${selectedMode === 'curriculum'
                                    ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-100'
                                    : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                                }`}
                        >
                            <div className="absolute top-4 right-4">
                                {selectedMode === 'curriculum' && (
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="text-5xl mb-4">📚</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Curriculum-Based</h3>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Structured academic learning with comprehensive coverage
                            </p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Units → Chapters → Lessons</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Prerequisites & grading</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Academic certificates</span>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                Best for: Academic subjects, certifications
                            </div>
                        </button>

                        {/* Professional-Based Option */}
                        <button
                            onClick={() => setSelectedMode('professional')}
                            className={`group relative p-8 rounded-2xl border-2 transition-all text-left ${selectedMode === 'professional'
                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-100'
                                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md'
                                }`}
                        >
                            <div className="absolute top-4 right-4">
                                {selectedMode === 'professional' && (
                                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            <div className="text-5xl mb-4">💼</div>
                            <h3 className="text-2xl font-black text-slate-900 mb-3">Professional Course</h3>
                            <p className="text-slate-600 mb-4 leading-relaxed">
                                Skills-focused training with practical application
                            </p>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Skills → Projects → Tasks</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Portfolio building</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-700">
                                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Professional certificates</span>
                                </div>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
                                Best for: Career skills, job training
                            </div>
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={() => selectedMode && onSelect(selectedMode)}
                            disabled={!selectedMode}
                            className="flex-1 py-6 text-lg font-bold"
                        >
                            {selectedMode === 'curriculum' && '📚 Create Curriculum Course'}
                            {selectedMode === 'professional' && '💼 Create Professional Course'}
                            {!selectedMode && 'Select a course type'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={onCancel}
                            className="px-8 py-6"
                        >
                            Cancel
                        </Button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-600 text-center">
                            💡 <strong>Tip:</strong> You can change the course type later in settings if needed
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
