import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';

export async function generateMetadata() {
  const { getLatestKeywords } = await import('@/lib/seo');
  const kws = await getLatestKeywords();
  return {
    title: 'AdaptIQ - AI-Powered Adaptive Learning Management System',
    description: 'Master any subject with AI-adaptive quizzes, personalized learning paths, and predictive analytics. Prepare for exams, track progress, and earn certificates.',
    keywords: kws.length ? kws : undefined,
  };
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <FadeIn>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Master Any Subject with
            <span className="text-blue-600 dark:text-blue-400"> AI-Powered Learning</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
            Adaptive quizzes that evolve in real-time. Personalized learning paths, exam preparation, 
            and predictive analytics to help you learn smarter and faster.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <SignedOut>
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-6">Start Learning Free</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6">Go to Dashboard</Button>
              </Link>
            </SignedIn>
            <Link href="/courses">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">Browse Courses</Button>
            </Link>
          </div>
        </FadeIn>
      </section>

      {/* Quick Access Cards */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Start Learning Now</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">Choose your learning path</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ScaleOnHover>
            <Link href="/courses">
              <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Courses</h3>
                  <p className="text-gray-600 dark:text-gray-400">Structured courses with lessons, quizzes, and certificates</p>
                </CardContent>
              </Card>
            </Link>
          </ScaleOnHover>
          <ScaleOnHover>
            <Link href="/subjects">
              <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-6xl mb-4">📖</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Subjects</h3>
                  <p className="text-gray-600 dark:text-gray-400">Practice by subject, level, and chapter</p>
                </CardContent>
              </Card>
            </Link>
          </ScaleOnHover>
          <ScaleOnHover>
            <Link href="/exams">
              <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Exams</h3>
                  <p className="text-gray-600 dark:text-gray-400">Prepare for SAT, ACT, GRE, GMAT, and more</p>
                </CardContent>
              </Card>
            </Link>
          </ScaleOnHover>
          <ScaleOnHover>
            <Link href="/preparations">
              <Card className="h-full hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Preparations</h3>
                  <p className="text-gray-600 dark:text-gray-400">Guided preparation tracks for success</p>
                </CardContent>
              </Card>
            </Link>
          </ScaleOnHover>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Why Choose AdaptIQ?</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Everything you need to learn smarter, faster, and more effectively
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🤖', title: 'AI-Adaptive Learning', desc: 'Questions automatically adjust difficulty based on your performance' },
            { icon: '📊', title: 'Predictive Analytics', desc: 'ML models identify knowledge gaps with 95% accuracy' },
            { icon: '⚡', title: 'Lightning Fast', desc: 'Serverless architecture delivers quizzes in <100ms globally' },
            { icon: '🏆', title: 'Gamification', desc: 'Earn achievements, climb leaderboards, and maintain study streaks' },
            { icon: '📈', title: 'Real-Time Progress', desc: 'Track mastery level and get personalized recommendations' },
            { icon: '🎓', title: 'Certificates', desc: 'Earn verifiable certificates for completing courses' },
          ].map((feature, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Quizzes Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-100">Accuracy Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">&lt;100ms</div>
              <div className="text-blue-100">Avg Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners using AI to master new skills faster.
          </p>
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">Start Learning Free</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">Go to Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">AdaptIQ</h3>
              <p className="text-sm">
                AI-powered adaptive learning platform that helps you master any subject faster.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Learn</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="hover:text-white">Courses</Link></li>
                <li><Link href="/subjects" className="hover:text-white">Subjects</Link></li>
                <li><Link href="/exams" className="hover:text-white">Exams</Link></li>
                <li><Link href="/preparations" className="hover:text-white">Preparations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/settings" className="hover:text-white">Settings</Link></li>
                <li><Link href="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 AdaptIQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
