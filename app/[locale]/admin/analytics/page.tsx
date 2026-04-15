import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { StatCard } from '@/components/ui/StatCard';
import { requireAdmin } from '@/lib/admin-check';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  let analytics = {
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    completionRate: 0,
    averageScore: 0,
    topSubjects: [] as any[],
    userGrowth: [] as any[],
  };

  try {
    const db = await getDatabase();

    const [users, courses, progress] = await Promise.all([
      db.collection('users').find({}).toArray(),
      db.collection('courses').find({}).toArray(),
      db.collection('userProgress').find({}).toArray(),
    ]);

    analytics.totalUsers = users.length;
    analytics.totalCourses = courses.length;
    analytics.totalQuizzes = progress.length;
    analytics.activeUsers = new Set(progress.map((p: any) => p.userId)).size;

    // Calculate average score
    const scores = progress.map((p: any) => p.score || 0).filter((s: number) => s > 0);
    analytics.averageScore = scores.length > 0
      ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
      : 0;

    // Calculate completion rate
    const completed = progress.filter((p: any) => p.completed).length;
    analytics.completionRate = progress.length > 0
      ? Math.round((completed / progress.length) * 100)
      : 0;

    // Top subjects
    const subjectCounts: Record<string, number> = {};
    progress.forEach((p: any) => {
      const subject = p.subject || 'General';
      subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
    });
    analytics.topSubjects = Object.entries(subjectCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  } catch (e) {
    console.error('Analytics error:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">


      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Insights</h1>
          <p className="text-gray-600 dark:text-gray-400">Detailed analytics about your platform</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={analytics.totalUsers.toLocaleString()}
            subtitle={`${analytics.activeUsers} active`}
            icon="👥"
          />
          <StatCard
            title="Total Courses"
            value={analytics.totalCourses.toLocaleString()}
            subtitle="Available"
            icon="📚"
          />
          <StatCard
            title="Completion Rate"
            value={`${analytics.completionRate}%`}
            subtitle="Quiz completion"
            icon="✅"
          />
          <StatCard
            title="Average Score"
            value={`${analytics.averageScore}%`}
            subtitle="Across all quizzes"
            icon="📊"
          />
        </div>

        {/* Top Subjects */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Top Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topSubjects.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.topSubjects.map((subject, idx) => (
                  <div key={subject.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{subject.name}</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">{subject.count} quizzes</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Analytics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Users</span>
                  <span className="font-semibold">{analytics.activeUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Quizzes</span>
                  <span className="font-semibold">{analytics.totalQuizzes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                  <span className="font-semibold">{analytics.completionRate}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                  <span className="font-semibold">{analytics.averageScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Courses</span>
                  <span className="font-semibold">{analytics.totalCourses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">User Growth</span>
                  <span className="font-semibold">+12%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

