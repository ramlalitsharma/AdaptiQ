'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { WorkflowControls } from '@/components/admin/WorkflowControls';
import { toast } from 'react-hot-toast';

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

interface CreateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateCourseModal({ onClose, onCreated }: CreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');

  const handleCreate = async () => {
    if (!title) return;
    setLoading(true);
    try {
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const res = await fetch('/api/admin/courses/neon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug, status: 'draft' })
      });
      if (!res.ok) throw new Error('Create failed');

      toast.success('Course created in Neon! 🚀');
      onCreated();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <CardHeader>
          <CardTitle className="text-xl font-black text-slate-900">New Neon Course</CardTitle>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">New content is stored in PostgreSQL</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Course Title</label>
            <input
              className="w-full rounded-xl border-slate-200 text-sm font-bold p-3"
              placeholder="e.g. Master Class: AI Engineering"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={handleCreate} isLoading={loading}>
              Create Course
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CourseManager({ courses }: CourseManagerProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
        <div className="flex gap-3">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, summary, or subject"
            className="w-full max-w-sm rounded-lg border border-slate-200 px-4 py-2 text-sm shadow-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 font-medium"
          />
          <Button
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold gap-2 px-6"
            onClick={() => setIsCreateModalOpen(true)}
          >
            Create Neon Course
          </Button>
        </div>
      </div>

      {isCreateModalOpen && (
        <CreateCourseModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            window.location.reload();
          }}
        />
      )}

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
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={courseStatus === 'published' ? 'success' : courseStatus === 'in_review' ? 'info' : 'default'}>
                        {courseStatus}
                      </Badge>
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${course.dbSource === 'neon' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {course.dbSource || 'mongodb'}
                      </span>
                    </div>
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
