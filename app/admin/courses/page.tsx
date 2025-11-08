import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { requireAdmin } from '@/lib/admin-check';
import { CourseManager } from '@/components/admin/CourseManager';

export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  let courses: any[] = [];
  try {
    const db = await getDatabase();
    courses = await db.collection('courses').find({}).sort({ createdAt: -1 }).limit(200).toArray();
  } catch (e) {
    console.error('Courses fetch error:', e);
  }

  const courseSummaries = courses.map((course) => ({
    id: course._id ? course._id.toString() : course.slug,
    title: course.title,
    slug: course.slug,
    status: course.status,
    summary: course.summary,
    subject: course.subject,
    level: course.level,
    modules: course.modules,
    updatedAt: course.updatedAt,
    createdAt: course.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm">
                ← Admin Panel
              </Button>
            </Link>
            <Link href="/admin/studio/courses">
              <Button size="sm">+ Create Course</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Course Management</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize, publish, and iterate on courses with full workflow visibility.
          </p>
        </div>

        <CourseManager courses={courseSummaries} />
      </main>
    </div>
  );
}

