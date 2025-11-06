export async function generateMetadata() {
  const { getLatestKeywords } = await import('@/lib/seo');
  const kws = await getLatestKeywords();
  return {
    title: 'AdaptIQ - AI-Powered Adaptive Learning Platform',
    description: 'Adaptive quizzes that evolve in real-time. Personalized learning paths and predictive analytics.',
    keywords: kws.length ? kws : undefined,
  };
}
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SiteBrand } from '@/components/layout/SiteBrand';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <nav className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <UserButton />
            </SignedIn>
            <Link href="/blog">
              <Button variant="ghost">Blog</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Transform Learning with
          <span className="text-blue-600"> AdaptIQ</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Adaptive quizzes that evolve in real-time based on your performance. 
          Predict knowledge gaps with 95% accuracy and master any subject faster.
        </p>
        <div className="flex gap-4 justify-center">
          <SignedOut>
            <SignInButton mode="modal">
              <Button size="lg">Get Started Free</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          </SignedIn>
          <Link href="/pricing">
            <Button size="lg" variant="outline">View Pricing</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose AdaptIQ?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to learn smarter, faster, and more effectively
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-3">AI-Adaptive Learning</h3>
            <p className="text-gray-600 leading-relaxed">
              Questions automatically adjust difficulty based on your performance, 
              ensuring optimal challenge level for faster mastery.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Predictive Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              ML models identify knowledge gaps before they become problems, 
              with 95% accuracy using Bayesian inference.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
            <p className="text-gray-600 leading-relaxed">
              Serverless architecture delivers quizzes in &lt;100ms globally, 
              with zero-ops scaling for millions of users.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-5xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-3">Gamification</h3>
            <p className="text-gray-600 leading-relaxed">
              Earn achievements, climb leaderboards, and maintain study streaks 
              to stay motivated and engaged.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-5xl mb-4">📈</div>
            <h3 className="text-xl font-semibold mb-3">Real-Time Progress</h3>
            <p className="text-gray-600 leading-relaxed">
              Track your mastery level, identify weak areas, and get personalized 
              recommendations for improvement.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="text-5xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-3">Certificates</h3>
            <p className="text-gray-600 leading-relaxed">
              Earn verifiable certificates for completing courses and mastering 
              subjects to showcase your achievements.
            </p>
          </div>
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

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Students Say</h2>
          <p className="text-xl text-gray-600">Join thousands of happy learners</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">
              "AdaptIQ transformed how I study. The adaptive quizzes help me focus 
              on what I need to learn, not what I already know."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                SC
              </div>
              <div>
                <div className="font-semibold text-gray-900">Sarah Chen</div>
                <div className="text-sm text-gray-500">Computer Science Student</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">
              "The leaderboard and achievements keep me motivated. I've improved 
              my test scores by 30% in just 2 months!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center font-semibold text-purple-600">
                MJ
              </div>
              <div>
                <div className="font-semibold text-gray-900">Mike Johnson</div>
                <div className="text-sm text-gray-500">High School Student</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-1 mb-4 text-yellow-400">
              {'★★★★★'.split('').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">
              "The AI really understands where I struggle. It's like having a 
              personal tutor that adapts to my learning style."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-semibold text-green-600">
                EW
              </div>
              <div>
                <div className="font-semibold text-gray-900">Emma Wilson</div>
                <div className="text-sm text-gray-500">Medical Student</div>
              </div>
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
              <Button size="lg" variant="secondary">Start Learning Free</Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button size="lg" variant="secondary">Go to Dashboard</Button>
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
              <h4 className="font-semibold text-white mb-4">Features</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/dashboard" className="hover:text-white">Adaptive Quizzes</Link></li>
                <li><Link href="/analytics" className="hover:text-white">Analytics</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Leaderboards</Link></li>
                <li><Link href="/dashboard" className="hover:text-white">Achievements</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
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