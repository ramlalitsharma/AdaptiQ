import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-check';
import { getDatabase } from '@/lib/mongodb';
import { CourseCreatorStudio } from '@/components/admin/CourseCreatorStudio';
import { BlogCreatorStudio } from '@/components/admin/BlogCreatorStudio';

export const dynamic = 'force-dynamic';

export default async function AdminStudioPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const db = await getDatabase();
  const [courses, blogs] = await Promise.all([
    db
      .collection('courses')
      .find({}, { projection: { title: 1, status: 1, level: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray(),
    db
      .collection('blogs')
      .find({}, { projection: { title: 1, status: 1, createdAt: 1 } })
      .sort({ createdAt: -1 })
      .limit(8)
      .toArray(),
  ]);

  const recentCourses = courses.map((course: any) => ({
    id: course._id ? String(course._id) : `${course.slug}`,
    title: course.title,
    status: course.status || 'draft',
    level: course.level,
    createdAt: course.createdAt,
  }));

  const recentBlogs = blogs.map((blog: any) => ({
    id: blog._id ? String(blog._id) : `${blog.slug}`,
    title: blog.title,
    status: blog.status || 'draft',
    createdAt: blog.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Admin Studio</h1>
            <p className="text-sm text-slate-500">Launch world-class learning assets with AI acceleration or manual precision.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="rounded-full border border-slate-200 px-3 py-1">AI authoring</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Manual drafting</span>
            <span className="rounded-full border border-slate-200 px-3 py-1">Version-aware workflow</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 space-y-10">
        <div className="grid gap-10 xl:grid-cols-2">
          <CourseCreatorStudio recentCourses={recentCourses} />
          <BlogCreatorStudio recentBlogs={recentBlogs} />
        </div>
      </main>
    </div>
  );
}


