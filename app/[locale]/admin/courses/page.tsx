import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { CourseManager } from '@/components/admin/CourseManager';
import { CourseServiceNeon } from '@/lib/course-service-neon';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  let legacyCourses: any[] = [];
  let neonCourses: any[] = [];

  try {
    const db = await getDatabase();
    legacyCourses = await db.collection('courses').find({}).sort({ createdAt: -1 }).limit(200).toArray();

    // Fetch from Neon as well
    neonCourses = await CourseServiceNeon.getAllCourses();
  } catch (e) {
    console.error('Courses fetch error:', e);
  }

  const legacySummaries = legacyCourses.map((course) => ({
    id: course._id ? course._id.toString() : course.slug,
    title: course.title,
    slug: course.slug,
    status: course.status,
    summary: course.summary,
    subject: course.subject,
    level: course.level,
    modules: course.modules,
    updatedAt: course.updatedAt instanceof Date ? course.updatedAt.toISOString() : course.updatedAt,
    createdAt: course.createdAt instanceof Date ? course.createdAt.toISOString() : course.createdAt,
    dbSource: 'mongodb'
  }));

  const neonSummaries = neonCourses.map((course) => ({
    ...course,
    dbSource: 'neon'
  }));

  const allCourses = [...neonSummaries, ...legacySummaries].sort((a, b) =>
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">


      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize, publish, and iterate on courses with full workflow visibility.
          </p>
        </div>

        <CourseManager courses={allCourses} />
      </main>
    </div>
  );
}

