import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { syncUserToDatabase } from '@/lib/user-sync';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { Achievements } from '@/components/achievements/Achievements';
import { Progress } from '@/components/ui/Progress';
import { Navbar } from '@/components/layout/Navbar';
import { StatCard } from '@/components/ui/StatCard';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { headers } from 'next/headers';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';
import { getDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  await syncUserToDatabase();
  const user = await currentUser();

  // Fetch real-time stats
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const cookie = (await headers()).get('cookie') || '';
  const common = { cache: 'no-store' as const, headers: { cookie } };
  const [statsRes, leaderboardRes, achievementsRes] = await Promise.all([
    fetch(`${baseUrl}/api/user/stats`, common),
    fetch(`${baseUrl}/api/leaderboard`, common),
    fetch(`${baseUrl}/api/achievements`, common),
  ]);
  const stats = statsRes.ok ? await statsRes.json() : { totalQuizzes: 0, averageScore: 0, knowledgeGaps: [], mastery: [] };
  const leaderboard = leaderboardRes.ok ? await leaderboardRes.json() : [];
  const achievements = achievementsRes.ok ? await achievementsRes.json() : [];

  // Fetch recent activity
  let recentActivity: any[] = [];
  let enrolledCourses: any[] = [];
  try {
    const db = await getDatabase();
    recentActivity = await db.collection('userProgress')
      .find({ userId })
      .sort({ completedAt: -1 })
      .limit(5)
      .toArray();
    
    enrolledCourses = await db.collection('courses')
      .find({ status: 'published' })
      .limit(3)
      .toArray();
  } catch (e) {
    console.error('Dashboard fetch error:', e);
  }

  const overallMastery = stats.mastery?.length > 0
    ? Math.round(stats.mastery.reduce((sum: number, m: any) => sum + (m.percent || 0), 0) / stats.mastery.length)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <FadeIn>
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, {user?.firstName || user?.name || 'Learner'}! Here's your learning overview.
            </p>
          </div>
        </FadeIn>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Quizzes" 
            value={stats.totalQuizzes || 0} 
            subtitle="Completed" 
            icon="📝" 
            color="blue"
            trend="+12%"
          />
          <StatCard 
            title="Average Score" 
            value={`${Math.round(stats.averageScore || 0)}%`} 
            subtitle="Mastery Level" 
            icon="📈" 
            color="green"
            trend="+5%"
          />
          <StatCard 
            title="Knowledge Gaps" 
            value={(stats.knowledgeGaps || []).length} 
            subtitle="Identified" 
            icon="🧩" 
            color="orange"
          />
          <StatCard 
            title="Overall Mastery" 
            value={`${overallMastery}%`} 
            subtitle="Across all subjects" 
            icon="🎯" 
            color="purple"
            trend="+8%"
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Learning Progress</CardTitle>
                  <Link href="/analytics">
                    <Button variant="outline" size="sm">View Details →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {stats.mastery && stats.mastery.length > 0 ? (
                  <div className="space-y-4">
                    {stats.mastery.slice(0, 5).map((m: any, idx: number) => (
                      <div key={m.subject || idx}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{m.subject || 'Unknown'}</span>
                          <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{m.percent || 0}%</span>
                        </div>
                        <Progress value={m.percent || 0} color={['blue', 'green', 'purple', 'orange', 'pink'][idx % 5] as any} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600 dark:text-gray-400">Start learning to see your progress</p>
                    <Link href="/subjects" className="mt-4 inline-block">
                      <Button>Browse Subjects</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((activity: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <span className="text-2xl">
                          {activity.completed ? '✅' : '📝'}
                        </span>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {activity.completed ? 'Completed' : 'Started'} quiz
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {activity.subject || 'General'} • {activity.score ? `${activity.score}%` : 'In progress'}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {activity.completedAt ? new Date(activity.completedAt).toLocaleDateString() : 'Just now'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-400">
                    No recent activity. Start a quiz to see your activity here.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Access */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Access</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link href="/courses">
                    <ScaleOnHover>
                      <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">📚</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">Courses</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Browse all courses</div>
                          </div>
                        </div>
                      </div>
                    </ScaleOnHover>
                  </Link>
                  <Link href="/subjects">
                    <ScaleOnHover>
                      <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">📖</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">Subjects</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Practice by subject</div>
                          </div>
                        </div>
                      </div>
                    </ScaleOnHover>
                  </Link>
                  <Link href="/exams">
                    <ScaleOnHover>
                      <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">📝</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">Exams</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Exam preparation</div>
                          </div>
                        </div>
                      </div>
                    </ScaleOnHover>
                  </Link>
                  <Link href="/preparations">
                    <ScaleOnHover>
                      <div className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">🎯</span>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">Preparations</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Guided tracks</div>
                          </div>
                        </div>
                      </div>
                    </ScaleOnHover>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Leaderboard entries={leaderboard} />

            {/* Achievements */}
            <Achievements achievements={achievements} />

            {/* My Learning */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Learning</CardTitle>
                  <Link href="/my-learning">
                    <Button variant="outline" size="sm">View All →</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-3">
                    {enrolledCourses.map((course: any) => (
                      <Link key={course._id} href={`/courses/${course.slug}`}>
                        <div className="p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
                          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{course.title}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {course.modules?.reduce((n: number, m: any) => n + (m.lessons?.length || 0), 0) || 0} lessons
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-600 dark:text-gray-400 text-sm">
                    No enrolled courses yet
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Knowledge Gaps */}
            {stats.knowledgeGaps && stats.knowledgeGaps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Gaps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {stats.knowledgeGaps.slice(0, 5).map((gap: any, idx: number) => (
                      <div key={idx} className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-sm">
                        <div className="font-medium text-orange-900 dark:text-orange-200">{gap.topic || gap.subject}</div>
                        <div className="text-xs text-orange-700 dark:text-orange-300 mt-1">Focus area for improvement</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
