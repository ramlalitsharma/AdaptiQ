'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/Button';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { LiveRoomCreator } from './LiveRoomCreator';
import { Activity, Sparkles, Box, Trash2 } from 'lucide-react';

// --- Types ---
interface ManualLesson {
  id?: string;
  title: string;
  contentType: 'video' | 'live' | 'quiz' | 'document' | 'text' | 'video-link';
  content?: string;
  videoUrl?: string;
  liveRoomId?: string;
  liveRoomConfig?: {
    roomName: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
  };
}

interface ManualChapter {
  id?: string;
  title: string;
  lessons: ManualLesson[];
}

interface ManualUnit {
  id?: string;
  title: string;
  chapters: ManualChapter[];
}

interface CourseOutlineEditorProps {
  units: ManualUnit[];
  onChange: (units: ManualUnit[]) => void;
  readOnly?: boolean;
  courseType?: 'video' | 'live';
  mode?: 'curriculum' | 'professional';
  courseTitle?: string;
  defaultLiveRoomId?: string | undefined;
  courseId?: string | undefined;
}


// --- Sortable Components ---

function SortableUnitItem({
  unit,
  unitIndex,
  onUpdateUnit,
  onRemoveUnit,
  mode = 'curriculum',
  onAddChapter,
  onUpdateChapter,
  onRemoveChapter,
  onAddLesson,
  onUpdateLesson,
  onRemoveLesson,
  readOnly,
  courseTitle = '',
  defaultLiveRoomId,
  courseId,
}: {
  unit: ManualUnit;
  unitIndex: number;
  onUpdateUnit: (index: number, title: string) => void;
  onRemoveUnit: (index: number) => void;
  onAddChapter: (uIndex: number) => void;
  onUpdateChapter: (uIndex: number, cIndex: number, title: string) => void;
  onRemoveChapter: (uIndex: number, cIndex: number) => void;
  onAddLesson: (uIndex: number, cIndex: number) => void;
  onUpdateLesson: (uIndex: number, cIndex: number, lIndex: number, field: keyof ManualLesson | Partial<ManualLesson>, val?: any) => void;
  onRemoveLesson: (uIndex: number, cIndex: number, lIndex: number) => void;
  readOnly?: boolean;
  mode?: 'curriculum' | 'professional';
  courseTitle?: string;
  defaultLiveRoomId?: string | undefined;
  courseId?: string | undefined;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `unit-${unitIndex}`,
    data: { type: 'unit', index: unitIndex },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`glass-card-premium rounded-[2.5rem] p-8 mb-8 transition-all relative overflow-hidden group ${isDragging ? 'opacity-50 ring-2 ring-elite-accent-cyan' : 'opacity-100 hover:border-elite-accent-cyan/30 shadow-2xl shadow-black/50'}`}>
      <div className="absolute top-0 left-0 w-1 h-full bg-elite-accent-cyan/20 group-hover:bg-elite-accent-cyan/50 transition-all" />

      <div className="flex items-center gap-6 mb-8">
        {!readOnly && (
          <div {...attributes} {...listeners} className="cursor-grab text-slate-700 hover:text-elite-accent-cyan transition-colors p-3 bg-white/5 rounded-xl border border-white/5">
            <Activity size={14} className="opacity-50" />
          </div>
        )}
        <div className="flex-1">
          <label className="space-y-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 block">
            {mode === 'professional' ? 'Strategic Domain' : 'Neural Sector'}
            <input
              value={unit.title}
              onChange={(e) => onUpdateUnit(unitIndex, e.target.value)}
              disabled={readOnly}
              placeholder={mode === 'professional' ? "Backend Essentials" : "Sector Title (e.g. Introduction)"}
              className="w-full text-xl font-black rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/5 focus:border-elite-accent-cyan/50 outline-none transition-all uppercase tracking-tight"
            />
          </label>
        </div>
        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={() => onRemoveUnit(unitIndex)} className="text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl h-10 w-10 p-0 transition-all">
            ×
          </Button>
        )}
      </div>

      <div className="pl-12 space-y-8 relative">
        <div className="absolute left-[22px] top-0 bottom-8 w-[2px] bg-gradient-to-b from-elite-accent-cyan/20 via-white/5 to-transparent" />

        <SortableContext items={(unit.chapters || []).map((_, i) => `chapter-${unitIndex}-${i}`)} strategy={verticalListSortingStrategy}>
          {(unit.chapters || []).map((chapter, chapterIndex) => (
            <SortableChapterItem
              key={`${unitIndex}-${chapterIndex}`}
              unitIndex={unitIndex}
              chapterIndex={chapterIndex}
              chapter={chapter}
              onUpdateChapter={onUpdateChapter}
              onRemoveChapter={onRemoveChapter}
              onAddLesson={onAddLesson}
              onUpdateLesson={onUpdateLesson}
              onRemoveLesson={onRemoveLesson}
              readOnly={readOnly}
              mode={mode}
              courseTitle={courseTitle}
              defaultLiveRoomId={defaultLiveRoomId}
              courseId={courseId}
            />
          ))}
        </SortableContext>

        {!readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddChapter(unitIndex)}
            className="w-full h-12 rounded-xl border-dashed border-white/10 text-slate-500 hover:text-white hover:bg-white/5 hover:border-white/20 text-[9px] font-black uppercase tracking-widest transition-all"
          >
            {mode === 'professional' ? '+ Initialize Project' : '+ Add Node Chapter'}
          </Button>
        )}
      </div>
    </div>
  );
}

function SortableChapterItem({
  unitIndex,
  chapterIndex,
  chapter,
  onUpdateChapter,
  onRemoveChapter,
  onAddLesson,
  onUpdateLesson,
  onRemoveLesson,
  readOnly,
  mode = 'curriculum',
  courseTitle = '',
  defaultLiveRoomId,
  courseId,
}: {
  unitIndex: number;
  chapterIndex: number;
  chapter: ManualChapter;
  onUpdateChapter: (uIndex: number, cIndex: number, title: string) => void;
  onRemoveChapter: (uIndex: number, cIndex: number) => void;
  onAddLesson: (uIndex: number, cIndex: number) => void;
  onUpdateLesson: (uIndex: number, cIndex: number, lIndex: number, field: keyof ManualLesson | Partial<ManualLesson>, val?: any) => void;
  onRemoveLesson: (uIndex: number, cIndex: number, lIndex: number) => void;
  readOnly?: boolean;
  mode?: 'curriculum' | 'professional';
  courseTitle?: string;
  defaultLiveRoomId?: string | undefined;
  courseId?: string | undefined;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `chapter-${unitIndex}-${chapterIndex}`,
    data: { type: 'chapter', unitIndex, chapterIndex },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-2xl border border-white/5 bg-white/5 p-6 relative group/chapter">
      <div className="flex items-center gap-4 mb-6">
        {!readOnly && (
          <div {...attributes} {...listeners} className="cursor-grab text-slate-700 hover:text-elite-accent-cyan transition-colors">
            <Activity size={12} className="opacity-30" />
          </div>
        )}
        <div className="flex-1">
          <label className="text-[9px] font-black text-slate-500 block mb-2 tracking-[0.2em] uppercase">
            {mode === 'professional' ? 'PROJECT MODULE' : 'NODE CHAPTER'}
          </label>
          <input
            value={chapter.title}
            onChange={(e) => onUpdateChapter(unitIndex, chapterIndex, e.target.value)}
            disabled={readOnly}
            placeholder={mode === 'professional' ? "Project title" : "Chapter title"}
            className="w-full font-bold rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-elite-accent-cyan/50 outline-none transition-all"
          />
        </div>
        {!readOnly && (
          <Button variant="ghost" size="sm" onClick={() => onRemoveChapter(unitIndex, chapterIndex)} className="h-8 w-8 p-0 text-slate-700 hover:text-red-400 transition-all">
            ×
          </Button>
        )}
      </div>

      <div className="space-y-4 pl-8 border-l border-white/5">
        {(chapter.lessons || []).map((lesson, lessonIndex) => (
          <LessonItem
            key={`${unitIndex}-${chapterIndex}-${lessonIndex}`}
            lesson={lesson}
            onUpdate={(field, val) => onUpdateLesson(unitIndex, chapterIndex, lessonIndex, field, val)}
            onRemove={() => onRemoveLesson(unitIndex, chapterIndex, lessonIndex)}
            readOnly={readOnly}
            courseTitle={courseTitle}
            chapterTitle={chapter.title}
            defaultLiveRoomId={defaultLiveRoomId}
            courseId={courseId}
          />
        ))}
        {!readOnly && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onAddLesson(unitIndex, chapterIndex)}
            className="text-[9px] font-black uppercase tracking-widest text-elite-accent-cyan hover:bg-elite-accent-cyan/10 px-4 h-8 rounded-lg transition-all"
          >
            + Link Neural Lesson
          </Button>
        )}
      </div>
    </div>
  );
}

function LessonItem({
  lesson,
  onUpdate,
  onRemove,
  readOnly,
  courseType = 'video',
  courseTitle = '',
  chapterTitle = '',
  defaultLiveRoomId,
  courseId,
}: {
  lesson: ManualLesson;
  onUpdate: (field: keyof ManualLesson | Partial<ManualLesson>, val?: any) => void;
  onRemove: () => void;
  readOnly?: boolean;
  courseType?: 'video' | 'live';
  courseTitle?: string;
  chapterTitle?: string;
  defaultLiveRoomId?: string | undefined;
  courseId?: string | undefined;
}) {
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleAIWrite = async () => {
    const btn = document.getElementById('ai-write-btn') as HTMLButtonElement;
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '✨ Writing...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/admin/courses/generate-lesson', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonTitle: lesson.title,
            courseTitle: courseTitle || 'Online Course',
            context: `Chapter: ${chapterTitle}`
          })
        });

        if (!res.ok) throw new Error('AI Write failed');

        const data = await res.json();
        onUpdate('content', data.content);
      } catch (err) {
        console.error(err);
        alert('Failed to generate content');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  };

  const handleAIQuiz = async () => {
    const btn = document.getElementById('ai-quiz-btn') as HTMLButtonElement;
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '🧠 Generating...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/admin/courses/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonTitle: lesson.title,
            courseTitle: courseTitle || 'Online Course',
            count: 5
          })
        });

        if (!res.ok) throw new Error('AI Quiz failed');

        const data = await res.json();
        onUpdate('content', JSON.stringify(data, null, 2));
      } catch (err) {
        console.error(err);
        alert('Failed to generate quiz');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  };

  // Define content types based on course type
  const getContentTypes = () => {
    if (courseType === 'live') {
      return [
        { type: 'live', icon: '🎥', title: 'Live Stream', desc: 'Scheduled session', color: 'indigo' },
        { type: 'text', icon: '📝', title: 'Text Entry', desc: 'Rich text content', color: 'emerald' },
        { type: 'document', icon: '📄', title: 'PDF / Doc', desc: 'Upload document', color: 'amber' },
        { type: 'quiz', icon: '❓', title: 'Interactive Quiz', desc: 'Test knowledge', color: 'purple' },
      ];
    }
    // Video course - show all options except live
    return [
      { type: 'video', icon: '📤', title: 'Video Upload', desc: 'Upload MP4/MOV', color: 'blue' },
      { type: 'video-link', icon: '🔗', title: 'Video Link', desc: 'YouTube, Vimeo', color: 'blue' },
      { type: 'text', icon: '📝', title: 'Text Entry', desc: 'Rich text content', color: 'emerald' },
      { type: 'document', icon: '📄', title: 'PDF / Doc', desc: 'Upload document', color: 'amber' },
      { type: 'quiz', icon: '❓', title: 'Interactive Quiz', desc: 'Test knowledge', color: 'purple' },
    ];
  };

  const handleAIAgenda = async () => {
    const btn = document.getElementById('ai-agenda-btn') as HTMLButtonElement;
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '✨ Planning...';
      btn.disabled = true;

      try {
        const res = await fetch('/api/admin/courses/generate-live-agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonTitle: lesson.title,
            courseTitle: courseTitle || 'Live Course',
            duration: '60 mins'
          })
        });

        if (!res.ok) throw new Error('AI Agenda failed');

        const data = await res.json();
        onUpdate('content', data.content);
      } catch (err) {
        console.error(err);
        alert('Failed to generate agenda');
      } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }
    }
  };

  const contentTypes = getContentTypes();

  return (
    <>
      <div className="rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 group/lesson">
        <div className="flex flex-wrap items-start gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <input
              value={lesson.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              disabled={readOnly}
              placeholder="Lesson Title"
              className="w-full text-xs font-bold rounded px-2 py-1 bg-transparent border-b border-white/5 focus:border-elite-accent-cyan/50 outline-none text-white uppercase tracking-widest placeholder:text-white/10"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={lesson.contentType}
              onChange={(e) => onUpdate('contentType', e.target.value)}
              disabled={readOnly}
              className="text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/10 px-3 py-1.5 bg-white/5 text-slate-300 outline-none appearance-none"
            >
              <option value="text" className="bg-elite-bg">Text Entry</option>
              <option value="video" className="bg-elite-bg">Video Class</option>
              <option value="live" className="bg-elite-bg">Live Stream</option>
              <option value="document" className="bg-elite-bg">PDF / Doc</option>
              <option value="quiz" className="bg-elite-bg">Interactive Quiz</option>
            </select>
            {!readOnly && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowContentEditor(true)}
                  className="h-8 px-4 text-[9px] font-black uppercase tracking-widest bg-white/5 text-white hover:bg-elite-accent-cyan hover:text-black rounded-lg transition-all"
                >
                  Configure
                </Button>
                <Button variant="ghost" size="sm" onClick={onRemove} className="h-8 w-8 p-0 text-slate-700 hover:text-red-400">
                  ×
                </Button>
              </>
            )}
          </div>
        </div>

        {lesson.contentType === 'text' && (
          <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden">
            <TipTapEditor
              value={lesson.content || ''}
              onChange={(next) => onUpdate('content', next)}
              height={120}
              placeholder="Detailed lesson notes..."
              disabled={readOnly}
            />
          </div>
        )}

        {lesson.contentType === 'video' && (
          <div className="space-y-3">
            <input
              value={lesson.videoUrl || ''}
              onChange={(e) => onUpdate('videoUrl', e.target.value)}
              placeholder="Asset URL (HLS/MP4)"
              className="w-full text-[10px] font-bold rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/10"
            />
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-1">Neural Relay Protocol: Direct CDN Link Required</p>
          </div>
        )}

        {lesson.contentType === 'live' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                value={lesson.liveRoomId || defaultLiveRoomId || ''}
                onChange={(e) => onUpdate('liveRoomId', e.target.value)}
                placeholder={defaultLiveRoomId ? "Course Default Active" : "Room Descriptor"}
                className="flex-1 text-[10px] font-bold rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none placeholder:text-white/10"
              />
              {!readOnly && (
                <button
                  onClick={async () => {
                    const roomToUse = lesson.liveRoomId || defaultLiveRoomId;
                    if (roomToUse) {
                      try {
                        const res = await fetch(`/api/live/rooms/${roomToUse}/start`, { method: 'POST' });
                        const data = await res.json();
                        const url = data.roomUrl || `/live/${roomToUse}`;
                        window.open(url, '_blank');
                      } catch {
                        window.open(`/live/${roomToUse}`, '_blank');
                      }
                    } else {
                      onUpdate('liveRoomId', '__CREATE_NEW__');
                    }
                  }}
                  className="px-6 py-2.5 bg-elite-accent-cyan text-black text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white transition-all whitespace-nowrap"
                >
                  {defaultLiveRoomId || lesson.liveRoomId ? 'Initialize Stream' : 'Secure Room'}
                </button>
              )}
            </div>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-1">Synchronous Node Relay v2.4</p>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                disabled={readOnly}
                className="text-[10px] font-black rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none"
              />
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                disabled={readOnly}
                className="text-[10px] font-black rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none"
              />
            </div>
            {!readOnly && (
              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    if (!scheduleDate || !scheduleTime) return;
                    const iso = `${scheduleDate}T${scheduleTime}`;
                    setIsScheduling(true);
                    try {
                      if (courseId) {
                        const res = await fetch('/api/live/schedule', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            roomName: lesson.title || 'Live Session',
                            courseId,
                            scheduledStartTime: iso
                          })
                        });
                        const data = await res.json();
                        if (data?.data?.room?.roomId) {
                          onUpdate('liveRoomId', data.data.room.roomId);
                        } else if (data?.room?.roomId) {
                          onUpdate('liveRoomId', data.room.roomId);
                        }
                      } else {
                        onUpdate('liveRoomConfig', {
                          roomName: lesson.title || 'Live Session',
                          scheduledDate: scheduleDate,
                          scheduledTime: scheduleTime,
                          duration: 60
                        });
                      }
                    } finally {
                      setIsScheduling(false);
                    }
                  }}
                  className="px-6 py-2.5 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-white/5 transition-all w-full flex items-center justify-center gap-2"
                  disabled={isScheduling || !scheduleDate || !scheduleTime}
                >
                  {isScheduling ? 'Syncing...' : 'Schedule Relay'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Editor Modal */}
      {showContentEditor && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-4 lg:p-12">
          <div className="glass-card-premium rounded-[3.5rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto p-12 border border-white/10 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-elite-accent-cyan/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="flex items-center justify-between mb-12 relative z-10">
              <div className="space-y-1">
                <h3 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">Lesson Configuration</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node ID: {lesson.id || 'Pending Synthesis'}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowContentEditor(false)} className="text-slate-500 hover:text-white text-xl">✕</Button>
            </div>

            {/* Lesson Title */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Lesson Title</label>
              <input
                value={lesson.title}
                onChange={(e) => onUpdate('title', e.target.value)}
                placeholder="e.g., Introduction to Python"
                className="w-full rounded-lg border border-slate-200 px-3 py-2"
              />
            </div>

            {/* Content Type Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-3">Content Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {contentTypes.map(({ type, icon, title, desc, color }) => (
                  <button
                    key={type}
                    onClick={() => onUpdate('contentType', type)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${lesson.contentType === type
                      ? `border-${color}-500 bg-${color}-50`
                      : 'border-slate-200 hover:border-blue-200'
                      }`}
                  >
                    <div className="text-2xl mb-2">{icon}</div>
                    <div className="font-bold text-sm">{title}</div>
                    <div className="text-xs text-slate-500">{desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Input */}
            <div className="mb-6">
              {lesson.contentType === 'video' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">Upload Video</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <div className="text-4xl mb-3">📤</div>
                    <div className="font-bold text-slate-700 mb-1">Drag & Drop Video</div>
                    <div className="text-sm text-slate-500 mb-3">or click to browse</div>
                    <input type="file" accept="video/*" className="hidden" />
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">Browse Files</button>
                  </div>
                  <p className="text-xs text-slate-500">Supported: MP4, MOV, AVI (Max 2GB)</p>
                </div>
              )}

              {lesson.contentType === 'video-link' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">Video URL</label>
                  <input
                    value={lesson.videoUrl || ''}
                    onChange={(e) => onUpdate('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />
                  <p className="text-xs text-slate-500">Paste a YouTube, Vimeo, or direct video link (HLS/m3u8 supported)</p>
                </div>
              )}

              {lesson.contentType === 'text' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Lesson Content</label>
                    <Button
                      size="xs"
                      variant="outline"
                      id="ai-write-btn"
                      onClick={handleAIWrite}
                      className="text-indigo-600 bg-indigo-50 border-indigo-200"
                    >
                      ✨ Write with AI
                    </Button>
                  </div>
                  <TipTapEditor
                    value={lesson.content || ''}
                    onChange={(next) => onUpdate('content', next)}
                    height={300}
                    placeholder="Write your lesson content here..."
                    disabled={readOnly}
                  />
                </div>
              )}

              {lesson.contentType === 'quiz' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-slate-700">Quiz Configuration (JSON)</label>
                    <Button
                      size="xs"
                      variant="outline"
                      id="ai-quiz-btn"
                      onClick={handleAIQuiz}
                      className="text-purple-600 bg-purple-50 border-purple-200"
                    >
                      🧠 Generate Quiz with AI
                    </Button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono">
                    <textarea
                      value={lesson.content || ''}
                      onChange={(e) => onUpdate('content', e.target.value)}
                      placeholder='{"questions": []}'
                      rows={15}
                      className="w-full bg-transparent outline-none resize-y"
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    Review the generated JSON structure. Ensure it follows the standard quiz format.
                  </p>
                </div>
              )}

              {lesson.contentType === 'live' && (
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-slate-700">Live Session Details</label>
                  <input
                    value={lesson.liveRoomId || ''}
                    onChange={(e) => onUpdate('liveRoomId', e.target.value)}
                    placeholder="Room Name or ID"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2"
                  />

                  {lesson.liveRoomId && lesson.liveRoomId !== '__CREATE_NEW__' && (
                    <div className="pt-2 space-y-3">
                      <div className="flex gap-2">
                        <a
                          href={`/live/${lesson.liveRoomId}`}
                          target="_blank"
                          className="flex-1"
                        >
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                            🚀 Start Class Now
                          </Button>
                        </a>
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Instructor Run Sheet / Agenda
                          </label>
                          <Button
                            size="xs"
                            variant="outline"
                            id="ai-agenda-btn"
                            onClick={handleAIAgenda}
                            className="text-indigo-600 border-indigo-200 bg-indigo-50"
                          >
                            ✨ Generate Agenda
                          </Button>
                        </div>
                        <TipTapEditor
                          value={lesson.content || ''}
                          onChange={(next) => onUpdate('content', next)}
                          height={200}
                          placeholder="Minute-by-minute plan for the live session..."
                          disabled={readOnly}
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-3">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Post-Class Actions
                        </label>
                        <div className="bg-slate-50 p-3 rounded-lg space-y-3 border border-slate-200">
                          <p className="text-xs text-slate-500">
                            Class finished? Attach the recording below to turn this into a video lesson for students who missed it.
                          </p>
                          <input
                            value={lesson.videoUrl || ''}
                            onChange={(e) => onUpdate('videoUrl', e.target.value)}
                            placeholder="Paste Recording URL (YouTube/Vimeo/MP4)"
                            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white"
                          />
                          {lesson.videoUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                              onClick={() => {
                                // Convert to video type but keep live history? 
                                // actually user wants to save video, effectively making it VOD available.
                                // We keep type as 'live' but if videoUrl exists, frontend should render the player.
                                // Or we can switch type to 'video-link'
                                onUpdate('contentType', 'video-link');
                              }}
                            >
                              💾 Save & Convert to Video Lesson
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setShowContentEditor(false)} className="flex-1">
                Save Lesson
              </Button>
              <Button variant="outline" onClick={() => setShowContentEditor(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Live Room Creator Modal */}
      {lesson.contentType === 'live' && lesson.liveRoomId === '__CREATE_NEW__' && (
        <LiveRoomCreator
          lessonTitle={lesson.title}
          onCancel={() => onUpdate('liveRoomId', '')}
          onCreateRoom={async (roomData, autoStart) => {
            // Generate a simple ID from name
            const roomId = roomData.roomName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substr(2, 6);

            // Save config and ID in one go to prevent state race condition
            onUpdate({
              liveRoomConfig: roomData,
              liveRoomId: roomId
            });

            // If "Start Now" was chosen, persist immediately and open
            if (autoStart) {
              try {
                // 1. Create room in DB first so it's not 404
                await fetch('/api/admin/live-rooms/create', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...roomData,
                    roomId,
                    courseId: 'draft-session' // Placeholder until course saved
                  })
                });

                // 2. Open room
                window.open(`/live/${roomId}`, '_blank');
              } catch (err) {
                console.error('Failed to auto-create room:', err);
                alert('Failed to start session automatically. Please save the course first.');
              }
            }
          }}
        />
      )}
    </>
  );
}

export function CourseOutlineEditor({
  units,
  onChange,
  readOnly = false,
  courseType = 'video',
  mode = 'curriculum',
  courseTitle = '',
  defaultLiveRoomId,
  courseId,
}: CourseOutlineEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Reorder Units
    if (activeIdStr.startsWith('unit-') && overIdStr.startsWith('unit-')) {
      const oldIndex = Number(activeIdStr.split('-')[1]);
      const newIndex = Number(overIdStr.split('-')[1]);
      onChange(arrayMove(units, oldIndex, newIndex));
      return;
    }

    // Reorder Chapters
    if (activeIdStr.startsWith('chapter-') && overIdStr.startsWith('chapter-')) {
      const [_, aUIdx, aCIdx] = activeIdStr.split('-').map(Number);
      const [__, oUIdx, oCIdx] = overIdStr.split('-').map(Number);

      if (aUIdx === oUIdx) {
        const newUnits = [...units];
        newUnits[aUIdx].chapters = arrayMove(newUnits[aUIdx].chapters, aCIdx, oCIdx);
        onChange(newUnits);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="space-y-6 max-h-[1200px] overflow-y-auto pr-2 custom-scrollbar">
        <SortableContext items={(units || []).map((_, i) => `unit-${i}`)} strategy={verticalListSortingStrategy}>
          {(units || []).map((unit, i) => (
            <SortableUnitItem
              key={`unit-${i}`}
              unit={unit}
              unitIndex={i}
              defaultLiveRoomId={defaultLiveRoomId}
              courseId={courseId}
              onUpdateUnit={(idx, title) => {
                const copy = [...units];
                copy[idx].title = title;
                onChange(copy);
              }}
              onRemoveUnit={(idx) => onChange(units.filter((_, u) => u !== idx))}
              onAddChapter={(uIdx) => {
                const copy = [...units];
                if (!copy[uIdx].chapters) copy[uIdx].chapters = [];
                copy[uIdx].chapters.push({ title: 'New Chapter', lessons: [] });
                onChange(copy);
              }}
              onUpdateChapter={(uIdx, cIdx, title) => {
                const copy = [...units];
                copy[uIdx].chapters[cIdx].title = title;
                onChange(copy);
              }}
              onRemoveChapter={(uIdx, cIdx) => {
                const copy = [...units];
                copy[uIdx].chapters = copy[uIdx].chapters.filter((_, c) => c !== cIdx);
                onChange(copy);
              }}
              onAddLesson={(uIdx, cIdx) => {
                const copy = [...units];
                if (!copy[uIdx].chapters[cIdx].lessons) copy[uIdx].chapters[cIdx].lessons = [];
                copy[uIdx].chapters[cIdx].lessons.push({ title: 'New Lesson', contentType: 'text' });
                onChange(copy);
              }}
              onUpdateLesson={(uIdx, cIdx, lIdx, field, val) => {
                console.log('Update Lesson Triggered:', { uIdx, cIdx, lIdx, field, val }); // DEBUG LOG
                const newUnits = [...units];
                const newUnit = { ...newUnits[uIdx] };
                const newChapters = [...(newUnit.chapters || [])];
                const newChapter = { ...newChapters[cIdx] };
                const newLessons = [...(newChapter.lessons || [])];
                const currentLesson = newLessons[lIdx];

                if (typeof field === 'object') {
                  newLessons[lIdx] = { ...currentLesson, ...field };
                } else {
                  newLessons[lIdx] = { ...currentLesson, [field as string]: val };
                }

                newChapter.lessons = newLessons;
                newChapters[cIdx] = newChapter;
                newUnit.chapters = newChapters;
                newUnits[uIdx] = newUnit;

                onChange(newUnits);
              }}
              onRemoveLesson={(uIdx, cIdx, lIdx) => {
                const copy = [...units];
                copy[uIdx].chapters[cIdx].lessons = copy[uIdx].chapters[cIdx].lessons.filter((_, l) => l !== lIdx);
                onChange(copy);
              }}
              readOnly={readOnly}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
