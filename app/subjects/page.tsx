import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { getLatestKeywords } from '@/lib/seo';

export default async function SubjectsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Metadata
  // canonical handled via layout metadataBase

  // Fetch real subjects from API (no mock data)
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/subjects`, { next: { revalidate: 1800 } });
  const subjects: any[] = res.ok ? await res.json() : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href="/dashboard">
            <span className="text-blue-600 hover:underline cursor-pointer">← Back</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs JSON-LD */}
        {/* <BreadcrumbsJsonLd items={[{ name: 'Home', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}` }, { name: 'Subjects', url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subjects` }]} /> */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Subjects</h2>
          <p className="text-gray-600">Choose a subject to start learning or take adaptive quizzes</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {subjects.length === 0 && (
            <p className="text-gray-500">No subjects available yet. Please add subjects in the admin panel.</p>
          )}
          {subjects.map((subject: any) => (
            <Link key={subject._id} href={`/subjects/${subject.slug || subject._id}`}>
              <Card hover className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-5xl">{subject.icon || '📚'}</div>
                    <Badge variant={subject.category === 'test-prep' ? 'warning' : 'info'} size="sm">
                      {(subject.category || 'academic').replace('-', ' ')}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{subject.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{subject.description || ' '}</p>
                  <div className="flex flex-wrap gap-2">
                    {(subject.levels || []).map((level: any) => (
                      <Badge key={level.id} variant="default" size="sm">
                        {level.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Guides & Resources */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Guides & Resources</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/blog">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><span className="text-2xl">📖</span>Study Guides</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Concept explainers, solved examples, and tips</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/preparations">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><span className="text-2xl">🎯</span>Guided Preparations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Basic → Advanced tracks with embedded quizzes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/exams">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><span className="text-2xl">🗂️</span>Exam Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Syllabi, patterns, and timed practice sets</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Exam Preparation Section */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Exam Preparation</h3>

          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">India</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'jee-main', name: 'JEE Main' },
                { id: 'jee-advanced', name: 'JEE Advanced' },
                { id: 'neet', name: 'NEET' },
                { id: 'gate', name: 'GATE' },
                { id: 'upsc-cse', name: 'UPSC CSE' },
                { id: 'ssc-cgl', name: 'SSC CGL' },
                { id: 'ibps-po', name: 'IBPS PO' },
                { id: 'cat', name: 'CAT' },
                { id: 'cuet', name: 'CUET' },
                { id: 'clat', name: 'CLAT' },
              ].map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                  <Card hover>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl mb-2">🇮🇳</div>
                      <div className="font-semibold text-gray-900">{exam.name}</div>
                      <div className="text-sm text-gray-500 mt-1">India</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Nepal</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: 'see', name: 'SEE' },
                { id: 'neb-grade-12', name: 'NEB Grade 12' },
                { id: 'ioe', name: 'IOE Entrance (BE)' },
                { id: 'ku-entrance', name: 'KU Entrance' },
                { id: 'mecce', name: 'MECEE (MBBS/MD)' },
              ].map((exam) => (
                <Link key={exam.id} href={`/exams/${exam.id}`}>
                  <Card hover>
                    <CardContent className="pt-6 text-center">
                      <div className="text-3xl mb-2">🇳🇵</div>
                      <div className="font-semibold text-gray-900">{exam.name}</div>
                      <div className="text-sm text-gray-500 mt-1">Nepal</div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">International</h4>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['SAT','ACT','GRE','GMAT','IELTS','TOEFL','MCAT','LSAT'].map((name) => {
                const id = name.toLowerCase();
                return (
                  <Link key={id} href={`/exams/${id}`}>
                    <Card hover>
                      <CardContent className="pt-6 text-center">
                        <div className="text-3xl mb-2">🌍</div>
                        <div className="font-semibold text-gray-900">{name}</div>
                        <div className="text-sm text-gray-500 mt-1">International</div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Curricula Section */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Curriculum Standards</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Common Core', icon: '📖', description: 'US Standards' },
              { name: 'AP Courses', icon: '🎓', description: 'Advanced Placement' },
              { name: 'IB Programme', icon: '🌍', description: 'International Baccalaureate' },
              { name: 'A-Levels', icon: '🇬🇧', description: 'UK Curriculum' },
              { name: 'IGCSE', icon: '🌐', description: 'International GCSE' },
              { name: 'Cambridge', icon: '🎯', description: 'Cambridge Curriculum' },
            ].map((curriculum) => (
              <Card hover key={curriculum.name}>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{curriculum.icon}</div>
                    <div>
                      <div className="font-semibold text-gray-900">{curriculum.name}</div>
                      <div className="text-sm text-gray-500">{curriculum.description}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata() {
  const kws = await getLatestKeywords();
  return {
    title: 'Browse Subjects | AdaptIQ',
    description: 'Select a subject and level to start AI-powered adaptive quizzes and track mastery.',
    keywords: kws.length ? kws : undefined,
  };
}
