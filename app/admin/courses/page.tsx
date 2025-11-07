import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { requireAdmin } from '@/lib/admin-check';
import { WorkflowControls } from '@/components/admin/WorkflowControls';

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
    courses = await db.collection('courses').find({}).sort({ createdAt: -1 }).limit(100).toArray();
  } catch (e) {
    console.error('Courses fetch error:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm">← Admin Panel</Button>
            </Link>
            <Link href="/admin/studio">
              <Button size="sm">+ Create Course</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Course Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all courses and their content</p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: {courses.length} courses
          </div>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first course to get started</p>
              <Link href="/admin/studio">
                <Button>Create Course</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => {
              const lessonCount = (course.modules || []).reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0);
              
              return (
                <Card key={course._id} className="h-full hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center">
                    <span className="text-6xl text-white opacity-90">📚</span>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={course.status === 'published' ? 'success' : 'default'}>
                        {course.status || 'draft'}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {lessonCount} lessons
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {course.summary || 'No description'}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/courses/${course.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">View</Button>
                      </Link>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="mt-4">
                      <WorkflowControls
                        contentType="course"
                        contentId={course.slug}
                        status={course.status || 'draft'}
                        updatedAt={course.workflowUpdatedAt ? new Date(course.workflowUpdatedAt).toISOString() : undefined}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

