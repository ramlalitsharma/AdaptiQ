import { auth, currentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { syncUserToDatabase } from '@/lib/user-sync';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { Achievements } from '@/components/achievements/Achievements';
import { Progress } from '@/components/ui/Progress';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { StatCard } from '@/components/ui/StatCard';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Sync user to MongoDB (for local development without webhooks)
  await syncUserToDatabase();

  const user = await currentUser();

  // Fetch real-time stats, leaderboard, achievements
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="bg-white/70 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="outline">Upgrade</Button>
            </Link>
            <span className="text-sm text-gray-600">{user?.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 md:p-8 text-white shadow-md mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.firstName || 'Learner'}
              </h2>
              <p className="opacity-90 mt-1">Let’s continue your adaptive learning journey.</p>
            </div>
            <Link href="/subjects">
              <Button variant="secondary">Browse Subjects</Button>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <StatCard title="Total Quizzes" value={stats.totalQuizzes || 0} subtitle="Completed" icon={<span>📝</span>} color="blue" />
          <StatCard title="Average Score" value={`${Math.round(stats.averageScore || 0)}%`} subtitle="Mastery" icon={<span>📈</span>} color="green" />
          <StatCard title="Knowledge Gaps" value={(stats.knowledgeGaps || []).length} subtitle="Identified" icon={<span>🧩</span>} color="orange" />
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Start Learning</h3>
            <Link href="/subjects">
              <Button variant="outline" size="sm">Browse All Subjects →</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Link href="/subjects">
              <Card hover>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Subjects</h4>
                    <p className="text-sm text-gray-600 mb-4">Browse subjects, levels and chapters</p>
                    <Button className="w-full">Explore</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/exams">
              <Card hover>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">📝</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Exams</h4>
                    <p className="text-sm text-gray-600 mb-4">SAT, GRE, JEE, NEET and more</p>
                    <Button className="w-full">Prepare</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/subjects?mode=preparations">
              <Card hover>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🎯</div>
                    <h4 className="font-semibold text-gray-900 mb-2">Preparations</h4>
                    <p className="text-sm text-gray-600 mb-4">Guided pathways with adaptive quizzes</p>
                    <Button className="w-full">Get Started</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/exams?type=international">
              <Card hover>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">🌍</div>
                    <h4 className="font-semibold text-gray-900 mb-2">International Exams</h4>
                    <p className="text-sm text-gray-600 mb-4">IELTS, TOEFL, SAT, GMAT, more</p>
                    <Button className="w-full">View Exams</Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Leaderboard entries={leaderboard} />
          <Achievements achievements={achievements} />
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Guides & Resources</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/blog">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📖</span>
                    Study Guides & Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Curated how‑tos and strategies for faster mastery</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/subjects">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🧩</span>
                    Practice Quizzes by Topic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Every subject level includes materials and quizzes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/exams">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">🗂️</span>
                    Exam Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Blueprints, tips, and timed practice sets</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Your Progress</h3>
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {(stats.mastery || []).length === 0 ? (
                  <p className="text-sm text-gray-500">No mastery data yet. Complete quizzes to see your progress.</p>
                ) : (
                  (stats.mastery || []).slice(0, 5).map((m: any, idx: number) => (
                    <div key={m.subject}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{m.subject}</span>
                        <span className="text-sm text-gray-500">{m.percent}%</span>
                      </div>
                      <Progress value={m.percent} color={idx % 2 === 0 ? 'blue' : 'purple'} />
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/subjects">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    Browse Subjects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Explore all subjects and topics</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/exams">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Exam Prep
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">SAT, ACT, GRE, GMAT, IELTS</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/analytics">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">See your progress and insights</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/admin">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-2xl">⚙️</span>
                    Admin
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Create quizzes and manage content</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
