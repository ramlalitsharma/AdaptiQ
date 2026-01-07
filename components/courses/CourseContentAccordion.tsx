'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Progress } from '@/components/ui/Progress';
import { ChevronDown, ChevronUp, Lock, PlayCircle, Video, MessageSquare, FileText, CheckCircle2 } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    slug: string;
    contentType?: 'video' | 'live' | 'quiz' | 'document' | 'text';
    content?: string;
}

interface Chapter {
    id: string;
    title: string;
    lessons: Lesson[];
}

interface Unit {
    id: string;
    title: string;
    chapters: Chapter[];
}

interface CourseContentAccordionProps {
    units: Unit[];
    slug: string;
    userId: string | null;
    completedLessonIds: string[];
    isEnrolled?: boolean;
}

export function CourseContentAccordion({ units, slug, userId, completedLessonIds, isEnrolled = false }: CourseContentAccordionProps) {
    // If legacy modules are passed, they might be in 'units' or we need to normalize them
    // Actually, the caller in page.tsx still passes 'modules' as 'units' for now.
    // Let's handle both.

    const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set([units[0]?.id]));
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

    const toggleUnit = (unitId: string) => {
        const newExpanded = new Set(expandedUnits);
        if (newExpanded.has(unitId)) {
            newExpanded.delete(unitId);
        } else {
            newExpanded.add(unitId);
        }
        setExpandedUnits(newExpanded);
    };

    const toggleChapter = (chapterId: string) => {
        const newExpanded = new Set(expandedChapters);
        if (newExpanded.has(chapterId)) {
            newExpanded.delete(chapterId);
        } else {
            newExpanded.add(chapterId);
        }
        setExpandedChapters(newExpanded);
    };

    const completedSet = new Set(completedLessonIds);

    const getIconForType = (type?: string) => {
        switch (type) {
            case 'video': return <PlayCircle className="w-4 h-4" />;
            case 'live': return <Video className="w-4 h-4 text-rose-500" />;
            case 'quiz': return <MessageSquare className="w-4 h-4 text-emerald-500" />;
            case 'document': return <FileText className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    return (
        <div className="space-y-6">
            {units.map((unit, uIdx) => {
                // Flatten all lessons in unit for progress calc
                const allLessonsInUnit = (unit.chapters || []).flatMap(c => c.lessons || []);
                const completedInUnit = allLessonsInUnit.filter(l => completedSet.has(l.id)).length;
                const unitProgress = allLessonsInUnit.length > 0
                    ? Math.round((completedInUnit / allLessonsInUnit.length) * 100)
                    : 0;
                const isUnitExpanded = expandedUnits.has(unit.id);
                const isUnitCompleted = allLessonsInUnit.length > 0 && completedInUnit === allLessonsInUnit.length;

                return (
                    <div key={unit.id || `unit-${uIdx}`} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                        {/* Unit Header */}
                        <div
                            className={`p-5 cursor-pointer flex items-center justify-between transition-colors ${isUnitExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800/30'}`}
                            onClick={() => toggleUnit(unit.id)}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 px-2 py-0.5 rounded uppercase tracking-wider">
                                        Unit {uIdx + 1}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{unit.title}</h3>
                                    {isUnitCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                                </div>
                                {userId && allLessonsInUnit.length > 0 && (
                                    <div className="mt-2 flex items-center gap-4 max-w-sm">
                                        <Progress value={unitProgress} color="green" className="h-1.5" />
                                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter w-12">
                                            {unitProgress}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="text-slate-400">
                                {isUnitExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                            </div>
                        </div>

                        {/* Unit Chapters */}
                        {/* We use isUnitExpanded check to conditionally render chapters */}
                        {isUnitExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-800 p-2 space-y-2">
                                {(unit.chapters || []).map((chapter, cIdx) => {
                                    const isChapterExpanded = expandedChapters.has(chapter.id);
                                    const completedInChapter = (chapter.lessons || []).filter(l => completedSet.has(l.id)).length;
                                    const isChapterCompleted = (chapter.lessons || []).length > 0 && completedInChapter === (chapter.lessons || []).length;
                                    const chapterKey = chapter.id || `chapter-${uIdx}-${cIdx}`;

                                    return (
                                        <div key={chapterKey} className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                            <div
                                                className={`px-4 py-3 cursor-pointer flex items-center justify-between text-sm font-semibold ${isChapterExpanded ? 'bg-slate-100/50 dark:bg-slate-800/80' : 'hover:bg-slate-100/30 dark:hover:bg-slate-800/40'}`}
                                                onClick={() => toggleChapter(chapter.id)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-400">Section {cIdx + 1}:</span>
                                                    <span className={isChapterCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}>
                                                        {chapter.title}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] text-slate-400 font-normal">{(chapter.lessons || []).length} lessons</span>
                                                    {isChapterExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </div>
                                            </div>

                                            {/* Chapter Lessons */}
                                            {isChapterExpanded && (
                                                <div className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800">
                                                    {(chapter.lessons || []).map((lesson, lIdx) => {
                                                        const isCompleted = completedSet.has(lesson.id);
                                                        const isLocked = !isEnrolled && userId; // Lock if logged in but not enrolled. (If not logged in, page handles it differently? Or should we lock regardless?) 
                                                        // Actually, requirements say "Non-enrolled users should see the curriculum structure but be unable to access".
                                                        const isAccessible = isEnrolled || isCompleted;

                                                        const LessonItem = (
                                                            <div
                                                                key={lesson.id || `lesson-${uIdx}-${cIdx}-${lIdx}`}
                                                                className={`flex items-center gap-4 p-4 transition-colors ${isAccessible ? 'hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer' : 'opacity-75 cursor-not-allowed'} ${isCompleted ? 'bg-emerald-50/20 dark:bg-emerald-900/5' : ''}`}
                                                            >
                                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : (
                                                                        !isAccessible ? <Lock className="w-4 h-4 text-slate-400" /> : getIconForType(lesson.contentType)
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className={`text-sm font-medium truncate ${isCompleted ? 'text-emerald-800 dark:text-emerald-300 line-through opacity-80' : 'text-slate-700 dark:text-slate-200'}`}>
                                                                        {lesson.title}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">{lesson.contentType || 'text'}</span>
                                                                        {!isAccessible && <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1"><Lock className="w-3 h-3" /> Locked</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );

                                                        return isAccessible ? (
                                                            <Link href={`/courses/${slug}/${lesson.slug}`} key={lesson.id || `lesson-${uIdx}-${cIdx}-${lIdx}`}>
                                                                {LessonItem}
                                                            </Link>
                                                        ) : (
                                                            <div key={lesson.id || `lesson-${uIdx}-${cIdx}-${lIdx}`} title="Enroll to access">
                                                                {LessonItem}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
