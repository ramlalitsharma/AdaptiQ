import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SiteBrand } from '@/components/layout/SiteBrand';

export default async function AdminPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  // Mark admin as noindex via meta robots tag using inline head script is unnecessary;
  // layout robots already blocks /admin in app/robots.ts

  // In production, check if user is admin
  // const user = await getUser(userId);
  // if (!user?.isAdmin) {
  //   redirect('/dashboard');
  // }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href="/dashboard">
            <span className="text-blue-600 hover:underline cursor-pointer">← Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Content Management</h2>
          <p className="text-gray-600">Create and manage quizzes, upload curriculum, and generate AI content</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card hover>
            <CardHeader>
              <CardTitle>AI-Only Course Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Manual course creation is disabled. Users enter a subject and select a level; AI selects questions automatically and dashboards update in real time.
              </p>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>Manage Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View and edit existing quizzes</p>
              <Button variant="outline" className="w-full">View All</Button>
            </CardContent>
          </Card>

          <Card hover>
            <CardHeader>
              <CardTitle>User Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">View system-wide analytics</p>
              <Button variant="outline" className="w-full">View Analytics</Button>
            </CardContent>
          </Card>

          
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Setup Subjects & Chapters</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/admin/subjects">
              <Card hover>
                <CardHeader>
                  <CardTitle>Manage Subjects & Chapters</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Add subjects, levels, and chapters (syllabus)</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Quiz Generator from PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload PDF File
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic/Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mathematics, History"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  defaultValue="10"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button type="submit" className="w-full">
                Generate Quiz
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
