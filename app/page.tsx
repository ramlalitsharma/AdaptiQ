import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getDatabase } from '@/lib/mongodb';

interface Course {
  _id: string;
  slug: string;
  title: string;
  summary?: string;
  subject?: string;
  level?: string;
  price?: { amount?: number; currency?: string } | number;
  thumbnail?: string;
  tags?: string[];
  createdAt?: string;
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

const contactInfo = [
  { icon: '✉️', label: 'Email', value: 'support@adaptiq.com' },
  { icon: '☎️', label: 'Phone', value: '+1 (555) 123-4567' },
  { icon: '📍', label: 'Location', value: '88 Innovation Drive, San Francisco, CA' },
];

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

export async function generateMetadata() {
  const { getLatestKeywords } = await import('@/lib/seo');
  const kws = await getLatestKeywords();
  return {
    title: 'AdaptIQ - Grow Your Skills, Build Your Future',
    description:
      'Discover trending courses, live classes, and online batches on AdaptIQ. Start learning with AI-powered personalization today.',
    keywords: kws.length ? kws : undefined,
  };
}

export default async function Home() {
  const db = await getDatabase();

  const [rawCourses, rawBlogs, rawSubjects, rawExams, rawPractice] = await Promise.all([
    db
      .collection('courses')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(9)
      .toArray()
      .catch(() => []),
    db
      .collection('blogs')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
    db
      .collection('subjects')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
    db
      .collection('examTemplates')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
    db
      .collection('practiceSets')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(6)
      .toArray()
      .catch(() => []),
  ]);

  const safeDate = (value: any) => (value instanceof Date ? value.toISOString() : value);

  const courses = (rawCourses as any[]).map((course) => ({
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
  }));

  const blogs = (rawBlogs as any[]).map((blog) => ({
    id: String(blog._id),
    slug: blog.slug,
    title: blog.title,
    excerpt: blog.excerpt || blog.markdown?.slice(0, 140),
    image: blog.metadata?.heroImage || blog.imageUrl,
    tags: blog.metadata?.tags || blog.tags || [],
    createdAt: safeDate(blog.createdAt),
  }));

  const subjects = (rawSubjects as any[]).map((subject) => ({
    id: String(subject._id),
    name: subject.name,
    slug: subject.slug || String(subject._id),
    description: subject.description,
    icon: subject.icon,
    category: subject.category,
  }));

  const exams = (rawExams as any[]).map((exam) => ({
    id: String(exam._id),
    name: exam.name,
    description: exam.description,
    category: exam.category,
    examType: exam.examType,
    releaseAt: safeDate(exam.releaseAt),
    tags: exam.tags || [],
    updatedAt: safeDate(exam.updatedAt),
  }));

  const practiceSets = (rawPractice as any[]).map((set) => ({
    id: String(set._id),
    title: set.title,
    description: set.description,
    questionCount: set.questionCount,
    tags: set.tags || [],
    releaseAt: safeDate(set.releaseAt),
    updatedAt: safeDate(set.updatedAt),
  }));

  const internationalExams = exams.filter((exam) => {
    const type = `${exam.examType || ''}`.toLowerCase();
    const category = `${exam.category || ''}`.toLowerCase();
    return type.includes('international') || category.includes('international');
  });

  const categories = Array.from(new Set(courses.map((c) => c.subject).filter(Boolean)));

  return (
    <div className="bg-[#f4f6f9] text-slate-900">
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Hero */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr),minmax(0,1fr)] items-center">
          <Card className="shadow-xl border-none">
            <CardContent className="space-y-6 pt-8 pb-10">
              <div className="max-w-xl space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                  Grow Your Skills,
                  <span className="text-emerald-600"> Build Your Future.</span>
                </h1>
                <p className="text-slate-600 text-base md:text-lg">
                  Discover courses, study resources, exam blueprints, and AI-powered learning journeys crafted for ambitious students.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <SignedOut>
                  <SignInButton mode="modal">
                    <Button className="px-6">Get Started</Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button className="px-6">Go to Dashboard</Button>
                  </Link>
                </SignedIn>
                <Link href="/courses">
                  <Button variant="outline" className="px-6">
                    Browse Library
                  </Button>
                </Link>
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-4 flex flex-col md:flex-row md:items-center gap-3">
                <select className="w-full md:w-auto rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Search courses, blogs, or exams"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <Button className="px-6">Search</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-none">
            <CardContent className="p-0">
              <img
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=80"
                alt="Learning"
                className="h-full w-full rounded-3xl object-cover"
              />
            </CardContent>
          </Card>
        </section>

        {/* Courses Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Courses</h2>
              <p className="text-sm text-slate-500">Fresh releases and top picks from the course library.</p>
            </div>
            <Link href="/courses">
              <Button variant="outline">View all courses</Button>
            </Link>
          </div>
          {courses.length === 0 ? (
            <Card className="border-dashed border-2 border-teal-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Publish a course to showcase it on the home page.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const badges = getBadges(course.tags, course.createdAt);
                return (
                  <Card key={course.id} className="overflow-hidden shadow-md">
                    <CardContent className="p-0">
                      <div className="h-40 w-full overflow-hidden">
                        <img
                          src={
                            course.thumbnail ||
                            'https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&w=800&q=80'
                          }
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="space-y-3 p-5">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{course.subject || 'General'}</span>
                          <span>•</span>
                          <span>{course.level ? course.level.toUpperCase() : 'All levels'}</span>
                          <div className="flex flex-wrap gap-1">
                            {badges.map((badge) => (
                              <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'}>
                                {badge}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-2">
                          {course.summary || 'Learn with interactive lessons, quizzes, and real projects.'}
                        </p>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-semibold text-emerald-600">
                            {formatPrice(course.price)}
                          </span>
                          <Link href={`/courses/${course.slug}`}>
                            <Button size="sm" className="px-4">
                              Enroll
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Subjects Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Subjects</h2>
              <p className="text-sm text-slate-500">Explore chapters and adaptive quizzes by subject.</p>
            </div>
            <Link href="/subjects">
              <Button variant="outline">Browse subjects</Button>
            </Link>
          </div>
          {subjects.length === 0 ? (
            <Card className="border-dashed border-2 border-blue-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Add subjects in the admin panel to feature them here.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {subjects.map((subject) => (
                <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                  <Card className="h-full hover:shadow-lg transition">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{subject.icon || '📚'}</span>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{subject.name}</h3>
                          {subject.category && (
                            <Badge variant="info" size="sm">
                              {subject.category.replace('-', ' ')}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2">
                        {subject.description || 'Structured modules with adaptive practice.'}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Exams Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Exams</h2>
              <p className="text-sm text-slate-500">Blueprints, cohorts, and mock tests to prepare with confidence.</p>
            </div>
            <Link href="/exams">
              <Button variant="outline">Explore exams</Button>
            </Link>
          </div>
          {exams.length === 0 ? (
            <Card className="border-dashed border-2 border-purple-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Publish an exam template from the admin studio to surface it here.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {exams.map((exam) => {
                const badges = getBadges(exam.tags, exam.updatedAt);
                return (
                  <Card key={exam.id} className="h-full border border-slate-200 bg-white shadow-sm">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{exam.category || 'Exam'}</span>
                        <div className="flex gap-1">
                          {badges.map((badge) => (
                            <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'}>
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{exam.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3">
                        {exam.description || 'Curated sections, difficulty mixes, and scheduling.'}
                      </p>
                      <Link href="/exams">
                        <Button variant="outline" size="sm" className="w-full">
                          View blueprint
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Preparations Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Preparations</h2>
              <p className="text-sm text-slate-500">Practice sets and cohort-ready drills to keep learners on track.</p>
            </div>
            <Link href="/preparations">
              <Button variant="outline">Guided tracks</Button>
            </Link>
          </div>
          {practiceSets.length === 0 ? (
            <Card className="border-dashed border-2 border-amber-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Create a practice set in the admin studio to highlight it here.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {practiceSets.map((set) => {
                const badges = getBadges(set.tags, set.updatedAt);
                return (
                  <Card key={set.id} className="h-full border border-slate-200 bg-white shadow-sm">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{set.questionCount || 0} questions</span>
                        <div className="flex gap-1">
                          {badges.map((badge) => (
                            <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'}>
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{set.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3">
                        {set.description || 'Timed practice sets with analytics-ready data.'}
                      </p>
                      <Link href="/preparations">
                        <Button variant="outline" size="sm" className="w-full">
                          Start practice
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* International Exams */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">International Exams</h2>
              <p className="text-sm text-slate-500">Global entrance and proficiency exams supported by AdaptIQ.</p>
            </div>
            <Link href="/exams?type=international">
              <Button variant="outline">All international exams</Button>
            </Link>
          </div>
          {internationalExams.length === 0 ? (
            <Card className="border-dashed border-2 border-indigo-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Tag exam templates with "international" to feature them here.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {internationalExams.map((exam) => {
                const badges = getBadges(exam.tags, exam.updatedAt);
                return (
                  <Card key={exam.id} className="h-full border border-slate-200 bg-white shadow-sm">
                    <CardContent className="space-y-3 p-5">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>International</span>
                        <div className="flex gap-1">
                          {badges.map((badge) => (
                            <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'}>
                              {badge}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{exam.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-3">
                        {exam.description || 'Comprehensive prep paths, mock exams, and analytics.'}
                      </p>
                      <Link href={`/exams?type=international`}>
                        <Button variant="outline" size="sm" className="w-full">
                          View details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Blog Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Blog</h2>
              <p className="text-sm text-slate-500">Insights, study tips, and product updates from the AdaptIQ team.</p>
            </div>
            <Link href="/blog">
              <Button variant="outline">Visit blog</Button>
            </Link>
          </div>
          {blogs.length === 0 ? (
            <Card className="border-dashed border-2 border-rose-200 bg-white/70">
              <CardContent className="py-12 text-center text-sm text-slate-500">
                Publish a blog post to surface it on the home page.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {blogs.map((post) => {
                const badges = getBadges(post.tags, post.createdAt);
                return (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="h-full hover:shadow-lg transition">
                      <CardContent className="space-y-3 p-5">
                        {post.image && (
                          <img src={post.image} alt={post.title} className="h-32 w-full rounded-lg object-cover" />
                        )}
                        <div className="flex gap-2">
                          {badges.map((badge) => (
                            <Badge key={badge} variant={badge === 'New' ? 'success' : 'info'}>
                              {badge}
                            </Badge>
                          ))}
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 line-clamp-2">{post.title}</h3>
                        <p className="text-sm text-slate-500 line-clamp-3">
                          {post.excerpt || 'Read the latest insights and best practices for adaptive learning.'}
                        </p>
                        <span className="text-xs text-slate-400">
                          {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ''}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Contact */}
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">Contact Us</h2>
            <p className="text-sm text-slate-500">Need a custom onboarding plan or school rollout? We&apos;re here to help.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr),minmax(0,1.2fr)]">
            <Card className="shadow-md border-none bg-slate-900 text-white">
              <CardContent className="space-y-6 p-6">
                {contactInfo.map((info) => (
                  <div key={info.label} className="flex items-start gap-3">
                    <span className="text-lg">{info.icon}</span>
                    <div>
                      <p className="text-sm uppercase tracking-wide text-slate-300">{info.label}</p>
                      <p className="text-base font-semibold">{info.value}</p>
                    </div>
                  </div>
                ))}
                <div className="rounded-xl bg-slate-800 p-4 text-sm leading-relaxed">
                  <h4 className="mb-2 font-semibold">Here&apos;s What Happens Next</h4>
                  <p>Step 1: We listen to your goals and challenges.</p>
                  <p>Step 2: We connect within one business day.</p>
                  <p>Step 3: We deliver a tailored learning plan.</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-md border-none">
              <CardContent className="p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="First Name" />
                  <input className="rounded-lg border border-slate-300 px-3 py-2" placeholder="Last Name" />
                </div>
                <input className="rounded-lg border border-slate-300 px-3 py-2 w-full" placeholder="Email" />
                <input className="rounded-lg border border-slate-300 px-3 py-2 w-full" placeholder="Subject" />
                <textarea
                  className="rounded-lg border border-slate-300 px-3 py-2 w-full"
                  rows={4}
                  placeholder="Write your message or feedback here..."
                />
                <Button className="w-full">Submit</Button>
                <p className="text-xs text-slate-500 text-center">
                  By contacting us, you agree to our Terms & Conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
