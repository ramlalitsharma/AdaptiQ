import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { CourseLibrary } from '@/components/courses/CourseLibrary';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function CoursesIndexPage() {
  let courses: any[] = [];
  try {
    const db = await getDatabase();
    courses = await db.collection('courses').find({ status: { $ne: 'draft' } }).sort({ createdAt: -1 }).limit(100).toArray();
  } catch (e) {
    courses = [];
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/my-learning">
              <Button variant="outline" size="sm">My Learning</Button>
            </Link>
            <Link href="/admin/studio">
              <Button variant="outline" size="sm">Admin Studio</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Course Library</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover courses tailored to your learning goals</p>
        </div>
        <CourseLibrary courses={courses} />
      </main>
    </div>
  );
}


