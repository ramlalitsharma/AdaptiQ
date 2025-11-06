import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { getLatestKeywords } from '@/lib/seo';

const exams = [
  {
    id: 'sat',
    name: 'SAT',
    fullName: 'Scholastic Assessment Test',
    description: 'Standardized test for college admissions in the US',
    duration: '3 hours',
    scoring: '400-1600',
    sections: 4,
    icon: '🎓',
  },
  {
    id: 'act',
    name: 'ACT',
    fullName: 'American College Testing',
    description: 'College entrance examination',
    duration: '2h 55m',
    scoring: '1-36',
    sections: 4,
    icon: '📝',
  },
  {
    id: 'gre',
    name: 'GRE',
    fullName: 'Graduate Record Examination',
    description: 'Graduate school admissions test',
    duration: '3h 45m',
    scoring: '260-340',
    sections: 3,
    icon: '🎯',
  },
  {
    id: 'gmat',
    name: 'GMAT',
    fullName: 'Graduate Management Admission Test',
    description: 'Business school admissions test',
    duration: '3h 7m',
    scoring: '200-800',
    sections: 4,
    icon: '💼',
  },
  {
    id: 'ielts',
    name: 'IELTS',
    fullName: 'International English Language Testing System',
    description: 'English proficiency test for study/work abroad',
    duration: '2h 45m',
    scoring: '0-9',
    sections: 4,
    icon: '🌍',
  },
  {
    id: 'toefl',
    name: 'TOEFL',
    fullName: 'Test of English as a Foreign Language',
    description: 'English proficiency test',
    duration: '3h 20m',
    scoring: '0-120',
    sections: 4,
    icon: '🗣️',
  },
  {
    id: 'mcat',
    name: 'MCAT',
    fullName: 'Medical College Admission Test',
    description: 'Medical school admissions test',
    duration: '7h 30m',
    scoring: '472-528',
    sections: 4,
    icon: '⚕️',
  },
  {
    id: 'lsat',
    name: 'LSAT',
    fullName: 'Law School Admission Test',
    description: 'Law school admissions test',
    duration: '3h 30m',
    scoring: '120-180',
    sections: 5,
    icon: '⚖️',
  },
  // India
  { id: 'jee-main', name: 'JEE Main', fullName: 'Joint Entrance Examination (Main)', description: 'Engineering entrance exam (India)', duration: '3h', scoring: 'NTA Score', sections: 3, icon: '🇮🇳' },
  { id: 'jee-advanced', name: 'JEE Advanced', fullName: 'Joint Entrance Examination (Advanced)', description: 'IIT entrance exam (India)', duration: '3h', scoring: 'Normalized', sections: 2, icon: '🇮🇳' },
  { id: 'neet', name: 'NEET', fullName: 'National Eligibility cum Entrance Test', description: 'Medical entrance exam (India)', duration: '3h 20m', scoring: '720', sections: 1, icon: '🇮🇳' },
  { id: 'gate', name: 'GATE', fullName: 'Graduate Aptitude Test in Engineering', description: 'Postgraduate engineering exam (India)', duration: '3h', scoring: '0-1000', sections: 1, icon: '🇮🇳' },
  { id: 'upsc-cse', name: 'UPSC CSE', fullName: 'Civil Services Examination', description: 'Government services exam (India)', duration: 'Varies', scoring: 'Scaled', sections: 3, icon: '🇮🇳' },
  { id: 'ssc-cgl', name: 'SSC CGL', fullName: 'Staff Selection Commission - CGL', description: 'Government recruitment exam', duration: 'Varies', scoring: 'Tiered', sections: 4, icon: '🇮🇳' },
  { id: 'ibps-po', name: 'IBPS PO', fullName: 'Institute of Banking Personnel Selection', description: 'Banking recruitment exam', duration: 'Varies', scoring: 'Tiered', sections: 3, icon: '🇮🇳' },
  { id: 'cat', name: 'CAT', fullName: 'Common Admission Test', description: 'MBA entrance exam (India)', duration: '2h', scoring: 'Scaled', sections: 3, icon: '🇮🇳' },
  { id: 'cuet', name: 'CUET', fullName: 'Common University Entrance Test', description: 'Undergraduate admissions (India)', duration: 'Varies', scoring: 'Scaled', sections: 3, icon: '🇮🇳' },
  { id: 'clat', name: 'CLAT', fullName: 'Common Law Admission Test', description: 'Law entrance exam (India)', duration: '2h', scoring: '0-150', sections: 5, icon: '🇮🇳' },
  // Nepal
  { id: 'see', name: 'SEE', fullName: 'Secondary Education Examination', description: 'National exam (Nepal)', duration: 'Varies', scoring: 'Grade', sections: 6, icon: '🇳🇵' },
  { id: 'neb-grade-12', name: 'NEB Grade 12', fullName: 'National Examinations Board - Grade 12', description: 'National higher secondary exam (Nepal)', duration: 'Varies', scoring: 'Grade', sections: 6, icon: '🇳🇵' },
  { id: 'ioe', name: 'IOE Entrance', fullName: 'IOE BE Entrance', description: 'Engineering entrance (Nepal)', duration: '2h', scoring: 'Percentile', sections: 1, icon: '🇳🇵' },
  { id: 'ku-entrance', name: 'KU Entrance', fullName: 'Kathmandu University Entrance', description: 'University entrance (Nepal)', duration: 'Varies', scoring: 'Percentile', sections: 1, icon: '🇳🇵' },
  { id: 'mecce', name: 'MECEE', fullName: 'Medical Education Commission - Entrance Exam', description: 'Medical entrance (Nepal)', duration: 'Varies', scoring: 'Percentile', sections: 1, icon: '🇳🇵' },
];

export default async function ExamsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href="/subjects">
            <span className="text-blue-600 hover:underline cursor-pointer">← Back to Subjects</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Prepare for Your Exams</h2>
          <p className="text-gray-600">
            Get personalized practice tests, study plans, and performance tracking for major standardized tests
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <Link key={exam.id} href={`/exams/${exam.id}`}>
              <Card hover className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-5xl">{exam.icon}</div>
                    <Badge variant="warning" size="sm">Test Prep</Badge>
                  </div>
                  <CardTitle className="text-xl">{exam.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">{exam.fullName}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{exam.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Duration:</span>
                      <span className="font-medium">{exam.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Scoring:</span>
                      <span className="font-medium">{exam.scoring}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Sections:</span>
                      <span className="font-medium">{exam.sections}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-4">Why Use AdaptIQ for Exam Prep?</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="text-3xl mb-2">🎯</div>
              <h4 className="font-semibold mb-2">Targeted Practice</h4>
              <p className="text-blue-100 text-sm">
                Focus on your weak areas with AI-powered recommendations
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold mb-2">Score Prediction</h4>
              <p className="text-blue-100 text-sm">
                Get accurate score predictions using ML models
              </p>
            </div>
            <div>
              <div className="text-3xl mb-2">⚡</div>
              <h4 className="font-semibold mb-2">Adaptive Learning</h4>
              <p className="text-blue-100 text-sm">
                Questions adjust to your level for optimal practice
              </p>
            </div>
          </div>
        </div>

        {/* Guides & Resources */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Guides & Resources</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/blog">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><span className="text-2xl">📖</span>Exam Tips & Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Timing strategies, section primers, and do/don’t lists</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/preparations">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><span className="text-2xl">🎯</span>Guided Preparations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Step-by-step tracks with materials and adaptive quizzes</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/subjects">
              <Card hover>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><span className="text-2xl">🧩</span>Practice by Subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">Drill topics and chapters aligned to each exam</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export async function generateMetadata() {
  const kws = await getLatestKeywords();
  return {
    title: 'Exam Preparation | AdaptIQ',
    description: 'Prepare for SAT, ACT, GRE, GMAT, IELTS and more with AI-adaptive practice and analytics.',
    keywords: kws.length ? kws : undefined,
  };
}
