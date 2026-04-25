import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDatabase } from '@/lib/mongodb';
import { CourseServiceNeon } from '@/lib/course-service-neon';
import { auth } from '@/lib/auth';
import { CourseSlider } from '@/components/courses/CourseSlider';
import { FallbackImage } from '@/components/ui/FallbackImage';
import { CategorySearch } from '@/components/search/CategorySearch';
import { BentoFeatures } from '@/components/home/BentoFeatures';
import { BRAND_NAME } from '@/lib/brand';
import { FadeIn } from '@/components/ui/Motion';
import { setRequestLocale } from 'next-intl/server';
import { TrendingUp, Zap, Target, Globe2, Activity, Bot, Cpu, ShieldCheck } from 'lucide-react';
import { EngineeredForExcellence, PathToExcellence } from '@/components/home/LandingV2';
import { HomeEventsShowcase } from '@/components/home/HomeEventsShowcase';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface Course {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  price?: { amount?: number; currency?: string } | number;
  thumbnail?: string;
  tags?: string[];
  createdAt?: string;
  dbSource?: 'mongo' | 'neon';
}

const NEW_THRESHOLD_DAYS = 7;
const NEW_THRESHOLD_MS = NEW_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;

const formatPrice = (price?: { amount?: number; currency?: string } | number) => {
  if (price === undefined || price === null) return 'Free';
  if (typeof price === 'number') {
    if (price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  }
  const amount = price.amount ?? 0;
  if (amount === 0) return 'Free';
  const currency = price.currency || 'USD';
  return `${currency.toUpperCase()} ${amount.toLocaleString()}`;
};

const safeDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  try {
    return new Date(date).toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const getCategoryDisplayName = (category: string) => {
  const displayNames: Record<string, string> = {
    'General': 'Featured Selection',
    'general': 'Featured Selection',
    'academic': 'Academic',
    'professional': 'Professional',
    'language': 'Language',
    'test-prep': 'Test Prep',
    'iq-cognitive': 'IQ & Cognitive',
  };
  return displayNames[category] || category;
};

const getBadges = (tags: string[] = [], createdAt?: string) => {
  const badges: string[] = [];
  if (tags.some((tag) => tag.toLowerCase() === 'trending')) badges.push('Trending');
  if (createdAt) {
    const created = new Date(createdAt).getTime();
    if (!Number.isNaN(created) && Date.now() - created < NEW_THRESHOLD_MS) {
      badges.push('New');
    }
  }
  return badges;
};

import { supabaseAdmin } from '@/lib/supabase';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  await params;
  const { getLatestKeywords } = await import('@/lib/seo');
  const kws = await getLatestKeywords();
  return {
    title: `${BRAND_NAME} | AI-Powered Learning & Global Intelligence Platform`,
    description:
      `Transform your future with ${BRAND_NAME}. Access AI-orchestrated courses, adaptive learning paths, and breaking global intelligence. Master the skills that matter with world-class precision.`,
    keywords: kws.length ? kws : ['AI Learning', 'Adaptive Education', 'Global News', 'Skill Building', 'Refectl'],
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const db = await getDatabase();
  const { userId } = await auth();

  const [rawCourses, rawNeonCourses, rawSubjects, rawNews] = await Promise.all([
    db
      .collection('courses')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()
      .catch(() => []),
    CourseServiceNeon.getAllCourses().catch(() => []),
    db
      .collection('subjects')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
    // Phase 50: Fetch Live Trending News for Landing
    supabaseAdmin
      ? supabaseAdmin
          .from('news')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
  ]);

  const trendingNews = (rawNews as any)?.data || [];

  const neonCoursesConverted: Course[] = (rawNeonCourses as any[]).map(c => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    summary: c.summary,
    subject: c.subject,
    level: c.level,
    price: c.price || 0,
    thumbnail: c.thumbnail,
    createdAt: (c as any).updatedAt || (c as any).created_at,
    dbSource: 'neon'
  }));

  const mongoCourses: Course[] = (rawCourses as any[]).map((course) => ({
    id: String(course._id),
    slug: course.slug || String(course._id),
    title: course.title,
    summary: course.summary,
    subject: course.subject,
    level: course.level,
    price: typeof course.price === 'object' ? course.price : { amount: course.price, currency: 'USD' },
    thumbnail: course.thumbnail,
    tags: Array.isArray(course.tags) ? course.tags : [],
    createdAt: safeDate(course.createdAt),
    dbSource: 'mongo'
  }));

  const courses = [...mongoCourses, ...neonCoursesConverted]
    .filter(c => !c.title.includes('dkn;lkfdf') && !c.title.includes('test')) // Filter out test data
    .sort((a, b) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

  // Get latest 6 courses for slider
  const latestCourses = courses.slice(0, 6);

  let enrollmentStatuses: Record<string, string> = {};
  if (userId && courses.length) {
    const courseIds = courses.map((course) => course.id);

    const [enrollments, completions] = await Promise.all([
      db
        .collection('enrollments')
        .find({ userId, courseId: { $in: courseIds } })
        .toArray()
        .catch(() => []),
      db
        .collection('courseCompletions')
        .find({ userId, courseId: { $in: courseIds } })
        .toArray()
        .catch(() => []),
    ]);

    const completedIds = new Set((completions as any[]).map((item) => item.courseId));

    enrollmentStatuses = (enrollments as any[]).reduce((acc: Record<string, string>, record: any) => {
      const key = record.courseId;
      if (completedIds.has(key)) {
        acc[key] = 'completed';
      } else {
        acc[key] = record.status;
      }
      return acc;
    }, {});

    completedIds.forEach((courseId: string) => {
      if (!enrollmentStatuses[courseId]) {
        enrollmentStatuses[courseId] = 'completed';
      }
    });
  }

  const subjects = (rawSubjects as any[]).map((subject) => ({
    id: String(subject._id),
    name: subject.name,
    slug: subject.slug || String(subject._id),
    description: subject.description,
    icon: subject.icon,
    category: subject.category,
  }));

  const subjectCategoryBySlug = new Map<string, string>();
  const subjectCategoryByName = new Map<string, string>();
  subjects.forEach((subject) => {
    if (subject.slug) subjectCategoryBySlug.set(subject.slug.toLowerCase(), subject.category || 'General');
    if (subject.name) subjectCategoryByName.set(subject.name.toLowerCase(), subject.category || 'General');
  });

  const categoryBuckets = new Map<string, Course[]>();
  courses.forEach((course) => {
    const subjectKey = course.subject ? course.subject.toLowerCase() : '';
    const category =
      subjectCategoryBySlug.get(subjectKey) ||
      subjectCategoryByName.get(subjectKey) ||
      'General';

    if (!categoryBuckets.has(category)) {
      categoryBuckets.set(category, []);
    }
    categoryBuckets.get(category)!.push(course);
  });

  const categoriesSet = new Set(
    subjects
      .map((subject) => subject.category)
      .filter((category): category is string => Boolean(category && category.trim())),
  );

  if (categoryBuckets.has('General')) {
    categoriesSet.add('General');
  }

  const categories = Array.from(categoriesSet);

  // Group subjects by category for dynamic display
  const subjectsByCategory = new Map<string, typeof subjects>();
  subjects.forEach((subject) => {
    const cat = subject.category || 'General';
    if (!subjectsByCategory.has(cat)) {
      subjectsByCategory.set(cat, []);
    }
    subjectsByCategory.get(cat)!.push(subject);
  });

  // Get all categories with their subjects
  const categoryData = categories.map((cat) => ({
    name: cat,
    displayName: getCategoryDisplayName(cat),
    subjects: subjectsByCategory.get(cat) || [],
    courses: categoryBuckets.get(cat) || [],
  }));

  return (
    <div className="home-ultra ultra-4k-shell min-h-screen bg-dot-grid overflow-x-hidden text-foreground selection:bg-elite-accent-cyan/30">
      <HomeEventsShowcase />
      {/* World-Class Elite Hero Section */}
      <section className="relative min-h-[90vh] sm:min-h-screen flex flex-col items-center justify-center overflow-hidden noise-texture bg-mesh pt-24 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-0" aria-labelledby="hero-title">
        {/* Advanced Ambient Glows - Reduced on mobile for performance */}
        <div className="absolute top-0 left-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-elite-accent-cyan/10 rounded-full blur-[80px] sm:blur-[120px] glow-pulse" aria-hidden="true" />
        <div className="absolute bottom-0 right-1/4 w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-elite-accent-purple/10 rounded-full blur-[80px] sm:blur-[120px] glow-pulse" style={{ animationDelay: '1s' }} aria-hidden="true" />

        {/* Floating UI Elements */}
        <div className="absolute top-20 right-10 hidden lg:block">
          <div className="glass-card-premium p-4 rounded-2xl border-white/10 float" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-elite-accent-cyan to-elite-accent-purple flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-white">Live Now</p>
                <p className="text-[10px] text-slate-400">2,547 learning</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-32 left-10 hidden lg:block">
          <div className="glass-card-premium p-4 rounded-2xl border-white/10 float" style={{ animationDelay: '1.5s' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-white">98% Success</p>
                <p className="text-[10px] text-slate-400">Completion rate</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-[1.2fr,1fr] gap-10 sm:gap-12 lg:gap-16 items-center">
            {/* Left Column: Hero Content */}
            <div className="space-y-10">
              {/* Platform Telemetry Bar */}
              <FadeIn className="hidden sm:block">
                <div className="flex items-center gap-8 py-3 px-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md mb-8 max-w-fit">
                   <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live News: <span className="text-white">Active</span></span>
                   </div>
                   <div className="w-px h-3 bg-white/10" />
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Agents: <span className="text-white">Operational</span></span>
                   </div>
                   <div className="w-px h-3 bg-white/10" />
                   <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Hub: <span className="text-white">Stable</span></span>
                   </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.1}>
                <h1 id="hero-title" className="text-5xl sm:text-7xl md:text-8xl lg:text-[130px] font-black leading-[0.85] tracking-tighter text-white">
                  The <span className="text-gradient-cyan">AI</span> <br />
                  <span className="text-white/40">Command</span> <br />
                  <span className="text-white">Center.</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="text-lg sm:text-xl md:text-2xl text-slate-400 max-w-2xl leading-relaxed font-medium">
                  Refectl is the unified ecosystem for high-performance intelligence. One platform to master skills, track global shifts, and forge the future.
                </p>
              </FadeIn>

              <FadeIn delay={0.3} className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-4 pt-6">
                <Link href="/news" className="w-full sm:w-auto">
                  <Button size="lg" className="h-16 rounded-2xl px-10 text-lg font-black bg-white text-black hover:bg-elite-accent-cyan transition-all w-full">
                    Read Intelligence
                  </Button>
                </Link>
                <Link href="/courses" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="h-16 rounded-2xl px-10 text-lg font-black border-white/20 text-white hover:bg-white/5 w-full">
                    Enter Academy
                  </Button>
                </Link>
              </FadeIn>
            </div>

            {/* Right Column: Intelligence Visualization */}
            <FadeIn delay={0.2} className="relative hidden lg:block">
              <div className="glass-card-premium p-10 rounded-[3rem] border-white/10 relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/10 rounded-full blur-3xl group-hover:bg-elite-accent-cyan/20 transition-all" />

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-black text-white">Growth Analytics</h3>
                      <p className="text-xs text-slate-500">Real-time skill assessment</p>
                    </div>
                    <span className="text-4xl font-black text-gradient-cyan">74%</span>
                  </div>

                  {/* Mock Chart Area */}
                  <div className="h-48 flex items-end gap-3 px-2">
                    {[40, 65, 45, 80, 55, 95].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-elite-accent-cyan/20 to-elite-accent-cyan/60 rounded-t-xl transition-all duration-1000"
                        style={{ height: `${h}%`, transitionDelay: `${i * 100}ms` }}
                      ></div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[10px] font-black uppercase text-slate-500 mb-1">Current Role</p>
                      <p className="font-bold text-sm">Mid-Level Designer</p>
                    </div>
                    <div className="bg-elite-accent-cyan/10 rounded-2xl p-4 border border-elite-accent-cyan/20">
                      <p className="text-[10px] font-black uppercase text-elite-accent-cyan mb-1">Next Goal</p>
                      <p className="font-bold text-sm text-white">Senior Architect</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -left-6 glass-card-premium px-6 py-4 rounded-3xl border-white/10 flex items-center gap-4 animate-bounce duration-[3000ms]">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-white">+12% Performance</p>
                  <p className="text-[10px] text-slate-500">Optimization Active</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* THE FOUR PILLARS OF POWER */}
      <section className="py-24 bg-black border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'The Academy', desc: 'Adaptive AI-powered courses and certified learning paths.', link: '/courses', icon: <Zap className="text-elite-accent-cyan" /> },
              { title: 'The Desk', desc: 'Real-time global intelligence and strategic market signals.', link: '/news', icon: <Globe2 className="text-blue-400" /> },
              { title: 'The Forge', desc: 'Premium creator assets, toolkits, and world-class resources.', link: '/shop', icon: <Target className="text-elite-accent-purple" /> },
              { title: 'The Hub', desc: '500+ AI utilities built for instant production results.', link: '/subjects', icon: <Activity className="text-emerald-400" /> },
            ].map((pillar) => (
              <Link key={pillar.title} href={pillar.link}>
                <div className="glass-card-premium p-8 rounded-[2.5rem] border-white/5 hover:border-white/20 hover:scale-[1.03] transition-all group h-full">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors">
                    {pillar.icon}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3 tracking-tight">{pillar.title}</h3>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">{pillar.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Breaking Intelligence: Live News Section */}
      <section className="py-20 bg-slate-50 dark:bg-black/40 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="space-y-2">
              <Badge variant="outline" className="text-elite-accent-cyan border-elite-accent-cyan/30 uppercase tracking-widest text-[10px] font-black">
                Live Feed
              </Badge>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Global <span className="text-gradient-cyan">Intelligence</span>
              </h2>
              <p className="text-slate-500 font-medium">Real-time industry shifts and high-impact reports from the Terai Times Desk.</p>
            </div>
            <Link href="/news">
              <Button variant="ghost" className="text-elite-accent-cyan font-black hover:bg-elite-accent-cyan/5">
                Full Intelligence Hub →
              </Button>
            </Link>
          </div>

          <div className="grid lg:grid-cols-[1fr,320px] gap-12">
            {/* Main Intelligence Grid */}
            <div className="space-y-6">
              {trendingNews.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {trendingNews.map((news: any) => (
                    <Link key={news.id} href={`/news/${news.slug}`}>
                      <div className="glass-card-premium p-5 rounded-[2rem] border-white/5 hover:border-white/10 transition-all group cursor-pointer flex gap-5 bg-white/5 h-full">
                        <div className="w-32 h-32 shrink-0 rounded-2xl overflow-hidden relative">
                          {news.cover_image ? (
                            <img src={news.cover_image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-elite-accent-cyan/20 to-elite-accent-purple/20" />
                          )}
                        </div>
                        <div className="flex flex-col justify-center flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className="bg-elite-accent-cyan/10 text-elite-accent-cyan border border-elite-accent-cyan/20 text-[8px] font-black uppercase tracking-widest">{news.category}</Badge>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Desk: TT-{news.id.slice(-4)}</span>
                          </div>
                          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-elite-accent-cyan transition-colors">
                            {news.title}
                          </h3>
                          <div className="flex items-center gap-4 pt-2">
                            <span className="text-[9px] text-slate-500 font-bold">{new Date(news.created_at).toLocaleDateString()}</span>
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-slate-400">
                               <Bot size={8} className="text-elite-accent-cyan" />
                               Neural Intelligence
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="glass-card-premium p-5 rounded-[2rem] border-white/5 opacity-50 flex gap-5">
                      <div className="w-32 h-32 bg-white/5 rounded-2xl animate-pulse" />
                      <div className="flex-1 space-y-3 py-2">
                        <div className="h-2 w-1/4 bg-white/5 rounded animate-pulse" />
                        <div className="h-4 w-full bg-white/5 rounded animate-pulse" />
                        <div className="h-2 w-1/2 bg-white/5 rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Intelligence Rail Sidebar */}
            <aside className="space-y-8 hidden lg:block">
               <div className="glass-card-premium p-6 rounded-[2.5rem] border-white/5 space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                    <Activity size={14} className="text-elite-accent-cyan" />
                    Network Sentiment
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Market Flux', value: 88, color: 'text-emerald-400' },
                      { label: 'Geopolitical Risk', value: 42, color: 'text-amber-400' },
                      { label: 'AI Saturation', value: 95, color: 'text-elite-accent-cyan' }
                    ].map((metric) => (
                      <div key={metric.label} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black uppercase">
                          <span className="text-slate-500">{metric.label}</span>
                          <span className={metric.color}>{metric.value}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full bg-current ${metric.color}`} style={{ width: `${metric.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

               <div className="glass-card-premium p-6 rounded-[2.5rem] border-elite-accent-purple/20 bg-elite-accent-purple/5 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-elite-accent-purple">Institutional Briefing</h3>
                  <p className="text-xs text-white font-bold leading-relaxed">
                    Deploy your global capital with confidence. Access verified intelligence reports designed for decision makers.
                  </p>
                  <Link href="/news" className="text-[9px] font-black text-elite-accent-purple uppercase hover:underline">
                    Access Terminal →
                  </Link>
               </div>

               <div className="glass-card-premium p-6 rounded-[2.5rem] border-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-elite-accent-cyan animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-white">Signal Integrity: 99.8%</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                      <span>Data Latency</span>
                      <span>14ms</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold">
                      <span>Active Relays</span>
                      <span>412</span>
                    </div>
                  </div>
               </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <BentoFeatures />

      {/* Modern High-Performance Features: Engineered for Excellence */}
      <EngineeredForExcellence />

      {/* Path to Excellence: Steps Section */}
      <PathToExcellence />

      {/* Academy Spotlight: Featured Courses */}
      {latestCourses.length > 0 && (
        <section className="bg-white dark:bg-[#050810] py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div className="space-y-2">
                <Badge variant="outline" className="text-elite-accent-cyan border-elite-accent-cyan/30 uppercase tracking-widest text-[10px] font-black">
                   Academy
                </Badge>
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  Elite <span className="text-gradient-cyan">Academy</span> Spotlight
                </h2>
                <p className="text-slate-500 font-medium">Certified paths designed for high-performance careers.</p>
              </div>
              <Link href="/courses" className="hidden sm:block">
                <Button variant="ghost" className="text-blue-600 dark:text-elite-accent-cyan font-black hover:bg-blue-50 dark:hover:bg-white/5">
                  View Full Catalog →
                </Button>
              </Link>
            </div>
            <CourseSlider courses={latestCourses} />
          </div>
        </section>
      )}

      {/* Dynamic Category Sections */}
      <div className="bg-slate-50">
        <div className="container mx-auto px-4 py-12 space-y-16">

          {/* Dynamic Category Sections */}
          {categoryData.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 bg-white">
              <CardContent className="py-16 text-center">
                <p className="text-slate-500 text-lg">No courses available yet. Start creating courses to see them here.</p>
              </CardContent>
            </Card>
          ) : (
            categoryData.map((categoryInfo) => {
              if (categoryInfo.courses.length === 0) return null;

              return (
                <div key={categoryInfo.name}>
                  <section className="space-y-6">
                    {/* Category Header with Subcategories */}
                    <div className="flex flex-col gap-8 mb-12">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                          <Badge variant="inverse" className="bg-blue-600 dark:bg-elite-accent-cyan dark:text-black text-[10px] font-black uppercase tracking-widest px-3">
                            {categoryInfo.displayName}
                          </Badge>
                          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                            {categoryInfo.name.toLowerCase() === 'general' ? 'Featured Specials' : `Master ${categoryInfo.displayName} `}
                          </h2>
                          <p className="text-slate-500 font-medium">
                            {categoryInfo.courses.length} Premium Tracks • {categoryInfo.subjects.length} Specializations
                          </p>
                        </div>
                        <Link href={`/courses?category=${encodeURIComponent(categoryInfo.name)}`}>
                          <Button variant="outline" className="rounded-2xl px-6 py-6 font-bold border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 transition-all">
                            View All Specializations →
                          </Button>
                        </Link>
                      </div>

                      {/* Subcategories (Subjects) as minimal pills */}
                      {categoryInfo.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {categoryInfo.subjects.map((subject) => (
                            <Link
                              key={subject.id}
                              href={`/courses?category=${encodeURIComponent(categoryInfo.name)}&subject=${encodeURIComponent(subject.slug)}`}
                              className="px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:shadow-lg transition-all"
                            >
                              {subject.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Courses Grid */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                      {categoryInfo.courses.slice(0, 10).map((course, courseIdx) => {
                        const badges = getBadges(course.tags, course.createdAt);
                        const enrollmentStatus = enrollmentStatuses[course.id];
                        const statusBadge =
                          enrollmentStatus === 'approved'
                            ? 'Enrolled'
                            : enrollmentStatus === 'completed'
                              ? 'Completed'
                              : enrollmentStatus === 'pending'
                                ? 'Awaiting Approval'
                                : enrollmentStatus === 'waitlisted'
                                  ? 'Waitlisted'
                                  : enrollmentStatus === 'rejected'
                                    ? 'Rejected'
                                    : null;

                        const renderActionButton = () => {
                          if (!userId) {
                            return (
                              <span className="text-xs font-semibold text-blue-600">View</span>
                            );
                          }

                          if (enrollmentStatus === 'approved' || enrollmentStatus === 'completed') {
                            return (
                              <span className="text-xs font-semibold text-green-600">
                                {enrollmentStatus === 'completed' ? 'Review' : 'Continue'}
                              </span>
                            );
                          }

                          if (enrollmentStatus === 'pending') {
                            return (
                              <span className="text-xs font-semibold text-yellow-600">Pending</span>
                            );
                          }

                          if (enrollmentStatus === 'waitlisted') {
                            return (
                              <span className="text-xs font-semibold text-blue-600">Waitlisted</span>
                            );
                          }

                          return (
                            <span className="text-xs font-semibold text-blue-600">Enroll</span>
                          );
                        };

                        return (
                          <FadeIn
                            key={course.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            delay={courseIdx * 0.05}
                          >
                            <Link href={`/courses/${course.slug}`}>
                              <Card className="group relative overflow-hidden border-none bg-white hover:shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer h-full flex flex-col rounded-3xl">
                                {/* Shimmer Effect on Hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none z-10"></div>

                                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                  <FallbackImage
                                    src={
                                      course.thumbnail ||
                                      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'
                                    }
                                    alt={course.title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    unoptimized={course.thumbnail?.startsWith('/uploads')}
                                  />
                                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                                    {badges.map((badge) => (
                                      <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'} className="text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/10 border-white/20 text-white">
                                        {badge}
                                      </Badge>
                                    ))}
                                  </div>
                                  {statusBadge && (
                                    <div className="absolute top-3 left-3">
                                      <Badge
                                        variant={
                                          enrollmentStatus === 'approved' || enrollmentStatus === 'completed'
                                            ? 'success'
                                            : enrollmentStatus === 'pending'
                                              ? 'warning'
                                              : enrollmentStatus === 'waitlisted'
                                                ? 'info'
                                                : 'error'
                                        }
                                        className="text-xs font-bold"
                                      >
                                        {statusBadge}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <CardContent className="p-6 flex-1 flex flex-col">
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{course.subject || 'General'}</span>
                                    {course.level && (
                                      <>
                                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{course.level}</span>
                                      </>
                                    )}
                                  </div>
                                  <h3 className="text-lg font-bold text-slate-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                                    {course.title}
                                  </h3>
                                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-1 leading-relaxed">
                                    {course.summary || 'Interactive lessons and real projects'}
                                  </p>
                                  <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div>
                                      <span className="text-xs text-slate-400 block mb-0.5">Price</span>
                                      <span className="text-xl font-black text-slate-900">
                                        {formatPrice(course.price)}
                                      </span>
                                    </div>
                                    <div className="bg-slate-50 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 px-4 py-2 rounded-xl">
                                      {renderActionButton()}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </Link>
                          </FadeIn>
                        );
                      })}
                    </div>

                    {categoryInfo.courses.length > 10 && (
                      <div className="text-center pt-4">
                        <Link href={`/courses?category=${encodeURIComponent(categoryInfo.name)}`}>
                          <Button variant="outline" className="font-semibold">
                            View all {categoryInfo.courses.length} courses in {categoryInfo.displayName} →
                          </Button>
                        </Link>
                      </div>
                    )}
                  </section>
                </div>
              );
            })
          )}

        </div>
      </div>
    </div>
  );
}
