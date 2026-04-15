import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PreparationsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-md mb-8">
        <h1 className="text-3xl font-bold mb-2">Guided Preparations</h1>
        <p className="opacity-90">Choose a pathway. We’ll auto‑generate materials and adaptive quizzes.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <Link href="/subjects?level=Basic">
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="text-2xl">🧱</span>Basics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">Fundamentals with quick checks and flash quizzes</p>
              <Button className="w-full">Start Basics</Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/subjects?level=Intermediate">
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="text-2xl">⚖️</span>Intermediate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">Skill‑building sets and timed practice</p>
              <Button className="w-full">Start Intermediate</Button>
            </CardContent>
          </Card>
        </Link>
        <Link href="/subjects?level=Advanced">
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="text-2xl">🚀</span>Advanced</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">Challenge problems and exam‑style drills</p>
              <Button className="w-full">Start Advanced</Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Guides & Resources</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/blog">
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="text-2xl">📖</span>Study Guides</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Topic primers, strategies, and checklists</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/subjects">
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="text-2xl">🧩</span>Practice by Chapter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Materials + embedded adaptive quizzes per chapter</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/exams">
          <Card hover>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><span className="text-2xl">⏱️</span>Exam Practice Sets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">Timed mocks with analytics and gap insights</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </main>
  );
}


