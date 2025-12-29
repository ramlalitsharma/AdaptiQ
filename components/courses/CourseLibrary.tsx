'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';

interface Course {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  modules?: Array<{ id?: string; title?: string; lessons?: unknown[] }>;
  createdAt?: string;
  icon?: string;
}

interface CourseLibraryProps {
  courses: Course[];
  initialEnrollmentStatuses?: Record<string, string>;
  isAuthenticated?: boolean;
}

export function CourseLibrary({
  courses: initialCourses,
  initialEnrollmentStatuses = {},
  isAuthenticated = false,
}: CourseLibraryProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
  const [enrollmentStatuses, setEnrollmentStatuses] = useState(initialEnrollmentStatuses);
  const [requestingCourse, setRequestingCourse] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/bookmarks')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const ids = (data as Array<{ courseId: string }>).map((b) => b.courseId);
          setBookmarked(new Set(ids));
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    setEnrollmentStatuses(initialEnrollmentStatuses);
  }, [initialEnrollmentStatuses]);

  useEffect(() => {
    let filtered = [...initialCourses];

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.summary?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterSubject) {
      filtered = filtered.filter((c) => c.subject === filterSubject);
    }

    if (filterLevel) {
      filtered = filtered.filter((c) => c.level === filterLevel);
    }

    setCourses(filtered);
  }, [search, filterSubject, filterLevel, initialCourses]);

  const subjects = useMemo(
    () => Array.from(new Set(initialCourses.map((c) => c.subject).filter(Boolean))) as string[],
    [initialCourses]
  );
  const levels = ['basic', 'intermediate', 'advanced'];

  const toggleBookmark = async (course: Course) => {
    const courseId = course._id || course.slug;
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          courseSlug: course.slug,
          courseTitle: course.title,
        }),
      });
      const data = await res.json();
      if (data.bookmarked !== undefined) {
        setBookmarked((prev) => {
          const next = new Set(prev);
          if (data.bookmarked) {
            next.add(courseId);
          } else {
            next.delete(courseId);
          }
          return next;
        });
      }
    } catch (e) {
      console.error('Bookmark error:', e);
    }
  };

  const requestEnrollment = async (course: Course) => {
    if (!isAuthenticated) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent('/courses')}`;
      return;
    }

    const courseId = course._id || course.slug;
    setRequestingCourse(courseId);
    try {
      const res = await fetch('/api/enrollments/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to request enrollment');
      }
      if (data.status) {
        setEnrollmentStatuses((prev) => ({ ...prev, [courseId]: data.status }));
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Enrollment request error:', error);
      alert(msg || 'Could not submit enrollment request');
    } finally {
      setRequestingCourse(null);
    }
  };

  return (
    <div className="space-y-10">
      <Card className="border border-slate-200 bg-white/90 shadow-xl">
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Smart filters</h3>
              <p className="text-sm text-slate-500">Search across {initialCourses.length} courses with instant filtering.</p>
            </div>
            <div className="text-xs uppercase tracking-wide text-slate-400">
              {courses.length} match{courses.length === 1 ? '' : 'es'}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr),minmax(0,0.5fr),minmax(0,0.5fr)]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
            >
              <option value="">All Levels</option>
              {levels.map((level) => (
                <option key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {courses.length === 0 ? (
        <Card className="border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <span className="text-5xl">🔍</span>
            <h3 className="text-xl font-semibold">No courses found</h3>
            <p className="text-sm text-white/70">
              Try adjusting your search keywords or selecting different filters to discover more courses.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, idx) => {
            const courseId = course._id || course.slug;
            const isBookmarked = bookmarked.has(courseId);
            const enrollmentStatus = enrollmentStatuses[courseId];

            // Content Type Detection
            const hasVideo = course.modules?.some(m => m.lessons?.some((l: any) =>
              l.resources?.some((r: any) => r.type === 'video') || l.videoUrl
            ));
            const hasText = course.modules?.some(m => m.lessons?.some((l: any) =>
              (l.content && typeof l.content === 'string' && l.content.trim().length > 0) || l.description
            ));

            let formatLabel = '';
            let formatIcon = '';
            if (hasVideo && hasText) {
              formatLabel = 'Text & Video';
              formatIcon = '📽️+📝';
            } else if (hasVideo) {
              formatLabel = 'Video';
              formatIcon = '📽️';
            } else if (hasText) {
              formatLabel = 'Text';
              formatIcon = '📝';
            }

            const statusLabel =
              enrollmentStatus === 'approved'
                ? 'Enrolled'
                : enrollmentStatus === 'completed'
                  ? 'Completed'
                  : enrollmentStatus === 'pending'
                    ? 'Awaiting Approval'
                    : null;

            const isNew = course.createdAt && (new Date().getTime() - new Date(course.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000);

            return (
              <FadeIn key={course.slug} delay={idx * 0.05}>
                <ScaleOnHover>
                  <Card className="group relative flex h-full flex-col overflow-hidden border border-slate-200 bg-white transition-all hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 rounded-3xl">
                    {/* Thumbnail Section */}
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-teal-500/20" />
                      <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-500 opacity-20">
                        {course.icon || '📘'}
                      </div>

                      {/* Enrolled Badge (Top Left) */}
                      {statusLabel && (
                        <div className="absolute left-3 top-3 z-10">
                          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md shadow-lg border ${enrollmentStatus === 'approved' || enrollmentStatus === 'completed'
                            ? 'bg-emerald-100/90 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100/90 text-amber-700 border-amber-200'
                            }`}>
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                            {statusLabel}
                          </span>
                        </div>
                      )}

                      {/* New Badge (Top Right) */}
                      {isNew && (
                        <div className="absolute right-3 top-3 z-10">
                          <span className="rounded-full bg-teal-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-teal-500/30">
                            NEW
                          </span>
                        </div>
                      )}

                      <button
                        onClick={(e) => { e.preventDefault(); toggleBookmark(course); }}
                        className="absolute bottom-3 right-3 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:text-teal-600 dark:bg-slate-800/90 dark:text-slate-400 hidden group-hover:flex"
                      >
                        {isBookmarked ? '★' : '☆'}
                      </button>
                    </div>

                    <CardContent className="flex flex-1 flex-col p-6">
                      <CardHeader className="p-0 mb-2">
                        <Link href={`/courses/${course.slug}`}>
                          <CardTitle className="text-xl font-bold leading-tight text-slate-900 group-hover:text-indigo-600 dark:text-white transition-colors">
                            {course.title}
                          </CardTitle>
                        </Link>
                      </CardHeader>

                      {/* Avoid Double Title: Only show summary if it's distinct from title */}
                      {course.summary &&
                        course.summary.toLowerCase().trim() !== course.title.toLowerCase().trim() &&
                        !course.title.toLowerCase().includes(course.summary.toLowerCase()) && (
                          <p className="mb-4 line-clamp-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            {course.summary}
                          </p>
                        )}

                      <div className="mt-auto mb-6 flex flex-wrap items-center gap-y-2 text-[11px] font-semibold text-slate-500">
                        {formatLabel && (
                          <>
                            <span className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400">
                              {formatLabel === 'Video' ? '🎬' : formatLabel === 'Text' ? '📄' : '📽️+📄'} {formatLabel}
                            </span>
                            <span className="mx-2 text-slate-300">•</span>
                          </>
                        )}
                        <span className="text-slate-600 dark:text-slate-300 truncate">
                          {course.subject || 'General'}
                        </span>
                        {course.level && (
                          <>
                            <span className="mx-2 text-slate-300">•</span>
                            <span className="text-indigo-500/80 dark:text-indigo-400/80">
                              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="pt-5 border-t border-slate-50 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Investment</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-black text-slate-900 dark:text-white">Free</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {isAuthenticated && (enrollmentStatus === 'approved' || enrollmentStatus === 'completed') ? (
                              <Link href={`/courses/${course.slug}`} className="group/btn flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 leading-none">
                                {enrollmentStatus === 'completed' ? 'Review' : 'Continue'}
                                <span className="text-base transition-transform group-hover/btn:translate-x-1 font-normal opacity-70">→</span>
                              </Link>
                            ) : (
                              <Button
                                variant="inverse"
                                className="rounded-2xl px-6 py-5 font-bold shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 border-none"
                                onClick={() => requestEnrollment(course)}
                                disabled={requestingCourse === courseId}
                              >
                                {requestingCourse === courseId ? (
                                  <span className="flex items-center gap-2">
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                                    Joining...
                                  </span>
                                ) : 'Enroll Now'}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}

