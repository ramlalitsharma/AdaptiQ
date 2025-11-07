import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/layout/Navbar';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FadeIn, ScaleOnHover } from '@/components/ui/Motion';

const heroStats = [
  { label: 'Active Learners', value: '10K+' },
  { label: 'Quizzes Completed', value: '1.2M+' },
  { label: 'Avg. Improvement', value: '32%' },
];

const featureHighlights = [
  {
    icon: '⚡',
    title: 'Adaptive AI Engine',
    description: 'Questions evolve based on your performance using GPT-4o and Bayesian mastery tracking.',
  },
  {
    icon: '🎯',
    title: 'Guided Learning Paths',
    description: 'Personalized subject tracks, exam preparation, and daily study plans keep you focused.',
  },
  {
    icon: '📊',
    title: 'Predictive Analytics',
    description: '95% accurate gap prediction with actionable insights and cohort benchmarking.',
  },
  {
    icon: '🏆',
    title: 'Gamified Motivation',
    description: 'Leaderboards, streaks, achievements, and certificates celebrate every milestone.',
  },
  {
    icon: '🤖',
    title: 'AI Content Studio',
    description: 'Instantly generate quizzes, courses, and blogs for every subject level.',
  },
  {
    icon: '🛡️',
    title: 'Enterprise-Grade Security',
    description: 'SOC2-ready practices, audit logging, and GDPR-compliant data export built-in.',
  },
];

const learningTracks = [
  {
    title: 'Academic Excellence',
    level: 'High School & University',
    icon: '📘',
    items: ['STEM mastery plans', 'Adaptive practice exams', 'Curriculum-aligned content'],
  },
  {
    title: 'Competitive Exams',
    level: 'SAT • GRE • IIT-JEE',
    icon: '🎓',
    items: ['Timed simulations', 'Section analytics', 'Daily AI revision coach'],
  },
  {
    title: 'Global Preparation',
    level: 'IELTS • TOEFL • GMAT',
    icon: '🌍',
    items: ['Speaking partners', 'Vocabulary flashcards', 'AI writing evaluator'],
  },
];

const testimonials = [
  {
    quote:
      'AdaptIQ feels like a personal tutor. My SAT Math score jumped from 640 to 750 in six weeks.',
    name: 'Riya Sharma',
    role: 'SAT Aspirant',
  },
  {
    quote:
      'The analytics dashboard helps our teachers intervene at the right moment. Student engagement is up 48%.',
    name: 'Dr. Michael Lee',
    role: 'Dean, BrightFuture Academy',
  },
  {
    quote:
      'I love the daily AI recommendations. The system knows exactly which topics I should revise before finals.',
    name: 'Ava Wilson',
    role: 'University Sophomore',
  },
];

export async function generateMetadata() {
  const { getLatestKeywords } = await import('@/lib/seo');
  const kws = await getLatestKeywords();
  return {
    title: 'AdaptIQ — AI-Powered Learning Management System',
    description:
      'The LMS that learns with you. Adaptive quizzes, predictive analytics, guided learning paths, and certificates in one beautiful experience.',
    keywords: kws.length ? kws : undefined,
  };
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100">
      {/* Ambient background gradients */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-6rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-400/30 blur-[140px]" />
        <div className="absolute right-[-10rem] top-24 h-[32rem] w-[32rem] rounded-full bg-indigo-400/25 blur-[160px]" />
        <div className="absolute bottom-[-12rem] left-[-8rem] h-[30rem] w-[30rem] rounded-full bg-cyan-400/20 blur-[150px]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        {/* Hero */}
        <section className="container mx-auto px-4 pt-20 pb-24">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr),minmax(0,0.9fr)] items-center">
            <div className="space-y-8">
              <FadeIn>
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-700 dark:text-blue-300">
                  ✨ Trusted by 200+ schools and 50k+ learners
                </div>
              </FadeIn>

              <FadeIn delay={0.05}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-tight tracking-tight text-slate-900 dark:text-white">
                  Master any subject with{' '}
                  <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                    AdaptIQ&apos;s AI learning platform
                  </span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.1}>
                <p className="max-w-2xl text-lg md:text-xl text-slate-600 dark:text-slate-300">
                  Adaptive quizzes, guided learning paths, and predictive analytics tailored to your
                  progress. Prepare for global exams, close knowledge gaps, and earn shareable
                  certificates — all in one beautiful LMS.
                </p>
              </FadeIn>

              <FadeIn delay={0.15}>
                <div className="flex flex-wrap items-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button size="lg" className="px-8 py-6 text-base shadow-lg shadow-blue-500/40">
                        Start learning free
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button size="lg" className="px-8 py-6 text-base shadow-lg shadow-blue-500/40">
                        Go to dashboard
                      </Button>
                    </Link>
                  </SignedIn>
                  <Link href="/courses">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 text-base border-slate-300 hover:border-blue-400 hover:text-blue-600"
                    >
                      Browse courses
                    </Button>
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                <div className="grid gap-4 sm:grid-cols-3">
                  {heroStats.map((stat, idx) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-5 py-4 shadow-md shadow-blue-500/10 backdrop-blur-xl"
                    >
                      <div className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {stat.value}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>

            <FadeIn delay={0.25}>
              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-full bg-blue-500/30 blur-3xl" />
                <div className="rounded-[26px] border border-white/30 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 shadow-2xl shadow-blue-500/20 backdrop-blur-2xl p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3 rounded-2xl bg-blue-500/10 px-4 py-3 text-blue-600 dark:text-blue-300">
                    <span className="text-2xl">📈</span>
                    <div>
                      <div className="text-sm font-medium uppercase tracking-wide text-blue-700 dark:text-blue-200">
                        Real-time mastery insights
                      </div>
                      <div className="text-xs text-blue-600/80 dark:text-blue-200/80">
                        Powered by Bayesian mastery scoring
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 text-sm">
                    {[
                      'Personalized quiz generation via GPT-4o',
                      'Live dashboards for learners & admins',
                      'Certificates, badges, and streaks built-in',
                      'Daily AI revision coach with smart reminders',
                    ].map((item, idx) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/60 px-4 py-3 shadow-sm"
                      >
                        <span className="mt-0.5 text-lg text-blue-500 dark:text-blue-400">✔</span>
                        <p className="text-slate-700 dark:text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-5 shadow-lg">
                    <div className="text-sm uppercase text-slate-300">Live metric</div>
                    <div className="mt-2 flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-semibold">92%</div>
                        <div className="text-xs text-slate-400">Average completion with AdaptIQ</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-emerald-400">+18% vs. traditional LMS</div>
                        <div className="text-xs text-slate-400">Updated 5 minutes ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Feature highlights */}
        <section className="container mx-auto px-4 pb-20">
          <FadeIn>
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
                Everything a modern learning experience needs
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
                AdaptIQ combines the power of adaptive AI with beautiful design and actionable
                analytics to keep students engaged and educators empowered.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featureHighlights.map((feature, idx) => (
              <FadeIn key={feature.title} delay={idx * 0.05}>
                <ScaleOnHover>
                  <Card className="h-full border border-white/60 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 shadow-lg shadow-blue-500/5 backdrop-blur-xl">
                    <CardContent className="pt-6 space-y-4">
                      <div className="text-4xl">{feature.icon}</div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </ScaleOnHover>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Learning tracks */}
        <section className="container mx-auto px-4 pb-20">
          <FadeIn>
            <div className="mb-10 flex flex-col gap-4 text-center">
              <span className="mx-auto inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1 text-sm font-medium text-blue-600 dark:text-blue-300">
                Learning journeys for every ambition
              </span>
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
                Choose your path. AdaptIQ guides the rest.
              </h2>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                Structured pathways designed by educators and powered by AI to keep you on track,
                every day.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {learningTracks.map((track, idx) => (
              <FadeIn key={track.title} delay={idx * 0.1}>
                <Card className="h-full border border-white/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 shadow-lg shadow-blue-500/10 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{track.icon}</span>
                      <div>
                        <CardTitle>{track.title}</CardTitle>
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">
                          {track.level}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {track.items.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-2 rounded-lg bg-slate-100/70 dark:bg-slate-800/70 px-3 py-2 text-sm text-slate-600 dark:text-slate-300"
                      >
                        <span className="mt-0.5 text-blue-500 dark:text-blue-400">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                    <Link href="/preparations">
                      <Button variant="outline" className="w-full border-blue-200 hover:border-blue-400">
                        Explore track
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="container mx-auto px-4 pb-20">
          <FadeIn>
            <div className="mb-10 text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
                Loved by learners. Trusted by institutions.
              </h2>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                AdaptIQ blends beautiful design with powerful AI. Here&apos;s what our community
                says.
              </p>
            </div>
          </FadeIn>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, idx) => (
              <FadeIn key={testimonial.name} delay={idx * 0.1}>
                <Card className="h-full border border-white/50 dark:border-white/10 bg-white/85 dark:bg-slate-900/70 shadow-lg shadow-blue-500/10 backdrop-blur-xl">
                  <CardContent className="space-y-4 pt-6">
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      “{testimonial.quote}”
                    </p>
                    <div className="space-y-1">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {testimonial.name}
                      </div>
                      <div className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-300">
                        {testimonial.role}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          <div className="absolute inset-y-0 left-[-10%] -z-10 h-[22rem] w-[22rem] rounded-full bg-white/20 blur-3xl" />
          <div className="absolute inset-y-0 right-[-15%] -z-10 h-[26rem] w-[26rem] rounded-full bg-white/10 blur-3xl" />

          <div className="container mx-auto px-4 py-20 text-center text-white">
            <FadeIn>
              <div className="mx-auto max-w-3xl space-y-6">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-medium tracking-wide">
                  🚀 Ready for launch
                </span>
                <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
                  Launch a world-class adaptive learning experience with AdaptIQ today.
                </h2>
                <p className="text-lg text-white/80">
                  Join educators and enterprises who trust AdaptIQ to power beautiful learning
                  journeys at scale. Zero setup, infinite possibilities.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="px-8 py-6 text-base font-semibold text-blue-700 shadow-2xl shadow-blue-900/30"
                      >
                        Start for free
                      </Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <Button
                        size="lg"
                        variant="secondary"
                        className="px-8 py-6 text-base font-semibold text-blue-700 shadow-2xl shadow-blue-900/30"
                      >
                        Continue learning
                      </Button>
                    </Link>
                  </SignedIn>
                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6 text-base border-white/60 text-white hover:bg-white/10"
                    >
                      View pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/60 backdrop-blur py-14">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-4">
              <div className="space-y-4">
                <SiteBrand />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  AdaptIQ blends adaptive AI, predictive analytics, and stunning design into the most
                  engaging LMS experience for learners, teachers, and institutions.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Product
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><Link className="hover:text-blue-600" href="/courses">Courses</Link></li>
                  <li><Link className="hover:text-blue-600" href="/subjects">Subjects</Link></li>
                  <li><Link className="hover:text-blue-600" href="/exams">Exams</Link></li>
                  <li><Link className="hover:text-blue-600" href="/analytics">Analytics</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Company
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><Link className="hover:text-blue-600" href="/pricing">Pricing</Link></li>
                  <li><Link className="hover:text-blue-600" href="/blog">Blog</Link></li>
                  <li><Link className="hover:text-blue-600" href="/privacy">Privacy</Link></li>
                  <li><Link className="hover:text-blue-600" href="/terms">Terms</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-900 dark:text-white">
                  Support
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li><Link className="hover:text-blue-600" href="/dashboard">Dashboard</Link></li>
                  <li><Link className="hover:text-blue-600" href="/settings">Settings</Link></li>
                  <li><Link className="hover:text-blue-600" href="/cookies">Cookie Policy</Link></li>
                  <li><Link className="hover:text-blue-600" href="/analytics">Usage Analytics</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 border-t border-slate-200/70 dark:border-slate-800/70 pt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} AdaptIQ. All rights reserved.
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
