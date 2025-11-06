'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';

interface Course {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  modules?: any[];
  createdAt?: string;
}

interface CourseLibraryProps {
  courses: Course[];
}

export function CourseLibrary({ courses: initialCourses }: CourseLibraryProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load bookmarks
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBookmarked(new Set(data.map((b: any) => b.courseId)));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let filtered = [...initialCourses];

    if (search) {
      filtered = filtered.filter(c => 
        c.title.toLowerCase().includes(search.toLowerCase()) ||
        c.summary?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterSubject) {
      filtered = filtered.filter(c => c.subject === filterSubject);
    }

    if (filterLevel) {
      filtered = filtered.filter(c => c.level === filterLevel);
    }

    setCourses(filtered);
  }, [search, filterSubject, filterLevel, initialCourses]);

  const subjects = Array.from(new Set(initialCourses.map(c => c.subject).filter(Boolean)));
  const levels = ['basic', 'intermediate', 'advanced'];

  const toggleBookmark = async (course: Course) => {
    const courseId = course._id || course.slug;
    const isBookmarked = bookmarked.has(courseId);
    
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
        const newSet = new Set(bookmarked);
        if (data.bookmarked) {
          newSet.add(courseId);
        } else {
          newSet.delete(courseId);
        }
        setBookmarked(newSet);
      }
    } catch (e) {
      console.error('Bookmark error:', e);
    }
  };

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Levels</option>
            {levels.map(l => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {courses.length} course{courses.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Course Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course, idx) => {
            const courseId = course._id || course.slug;
            const isBookmarked = bookmarked.has(courseId);
            const lessonCount = course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0;

            return (
              <FadeIn key={course.slug} delay={idx * 0.05}>
                <ScaleOnHover>
                  <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300">
                    <Link href={`/courses/${course.slug}`} className="flex-1 flex flex-col">
                      <div className="aspect-video bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-t-xl relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-6xl text-white opacity-90">📚</span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleBookmark(course);
                            }}
                            className="bg-white/90 hover:bg-white rounded-full p-2 shadow-lg"
                            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                          >
                            {isBookmarked ? '⭐' : '☆'}
                          </button>
                        </div>
                      </div>
                      <CardHeader className="flex-1">
                        <CardTitle className="line-clamp-2 text-lg">{course.title}</CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                          {course.summary || 'A comprehensive adaptive course'}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                          <span>{course.subject || 'General'}</span>
                          <span>{lessonCount} lessons</span>
                        </div>
                        {course.level && (
                          <span className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs font-medium mb-3">
                            {course.level}
                          </span>
                        )}
                        <Button className="w-full">View Course</Button>
                      </CardContent>
                    </Link>
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

