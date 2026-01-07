'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WorkflowControls } from '@/components/admin/WorkflowControls';

interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  status?: string;
  summary?: string;
  subject?: string;
  level?: string;
  modules?: { lessons?: any[] }[];
  updatedAt?: string;
  createdAt?: string;
}

interface CourseManagerProps {
  courses: CourseSummary[];
}

const STATUS_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'in_review', label: 'In Review' },
  { key: 'approved', label: 'Approved' },
  { key: 'published', label: 'Published' },
];

export function CourseManager({ courses }: CourseManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(courses.map((c) => [c.slug, c.status || 'draft']))
  );

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const matchesStatus = statusFilter === 'all' ? true : (course.status || 'draft') === statusFilter;
      const haystack = `${course.title} ${course.summary || ''} ${course.subject || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [courses, statusFilter, search]);

  const totals = useMemo(() => {
    const map = new Map<string, number>();
    courses.forEach((course) => {
      const key = course.status || 'draft';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [courses]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Courses ({courses.length})</h2>
          <p className="text-sm text-slate-500">Search, filter, and manage course lifecycle from one place.</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, summary, or subject"
          className="w-full max-w-sm rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((filter) => {
          const count = filter.key === 'all' ? courses.length : totals.get(filter.key) || 0;
          return (
            <Button
              key={filter.key}
              variant={statusFilter === filter.key ? 'inverse' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(filter.key)}
            >
              {filter.label}
              <span className="ml-2 rounded-full bg-slate-200 px-2 text-xs text-slate-600">{count}</span>
            </Button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-600">No courses match your filters.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => {
            const courseStatus = statuses[course.slug] || course.status || 'draft';
            const setCourseStatus = (next: string) =>
              setStatuses((prev) => ({ ...prev, [course.slug]: next }));
            return (
              <Card key={course.slug} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={courseStatus === 'published' ? 'success' : courseStatus === 'in_review' ? 'info' : 'default'}>
                      {courseStatus}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Updated {course.updatedAt ? new Date(course.updatedAt).toLocaleString() : '—'}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/admin/studio/courses?slug=${course.slug}`}>Manage</Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild className="flex-1">
                      <Link href={`/courses/${course.slug}`}>View</Link>
                    </Button>
                  </div>
                  <WorkflowControls
                    contentType="course"
                    contentId={course.slug}
                    status={courseStatus}
                    updatedAt={course.updatedAt}
                    onStatusChange={setCourseStatus}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
