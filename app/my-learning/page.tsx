import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Progress } from '@/components/ui/Progress';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

export const dynamic = 'force-dynamic';

export default async function MyLearningPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const user = await currentUser();
  let enrolledCourses: any[] = [];
  let progress: Record<string, any> = {};

  try {
    const db = await getDatabase();
    // Get user's enrolled courses (for now, all published courses are "enrolled" - can add enrollment logic later)
    enrolledCourses = await db.collection('courses').find({ status: 'published' }).limit(20).toArray();
    
    // Get progress for each course
    const userProgress = await db.collection('userProgress').find({ userId }).toArray();
    progress = userProgress.reduce((acc: any, p: any) => {
      const courseId = p.courseId || p.subject;
      if (!acc[courseId]) acc[courseId] = { completed: 0, total: 0, lastAccessed: p.completedAt };
      acc[courseId].completed++;
      acc[courseId].total++;
      return acc;
    }, {});
  } catch (e) {
    console.error('My Learning fetch error:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm">Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Learning</h1>
          <p className="text-gray-600 dark:text-gray-400">Continue your courses and track your progress</p>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No courses enrolled yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Start learning by browsing our course library</p>
              <Link href="/courses">
                <Button>Browse Courses</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course: any) => {
              const courseProgress = progress[course._id] || { completed: 0, total: 0 };
              const percent = course.modules?.length 
                ? Math.round((courseProgress.completed / (course.modules.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 1)) * 100)
                : 0;
              
              return (
                <Link key={course._id} href={`/courses/${course.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-xl flex items-center justify-center">
                      <span className="text-6xl text-white opacity-80">{course.icon || '📚'}</span>
                    </div>
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0} lessons
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Progress</span>
                          <span className="font-medium text-gray-900 dark:text-white">{percent}%</span>
                        </div>
                        <Progress value={percent} color="blue" />
                      </div>
                      <Button className="w-full mt-4">Continue Learning</Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

