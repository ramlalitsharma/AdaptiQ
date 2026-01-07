import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AdminSubjectForm } from '@/components/admin/AdminSubjectForm';
import { AdminTopicForm } from '@/components/admin/AdminTopicForm';
import { requireAdmin } from '@/lib/admin-check';
import { resolveBaseUrl } from '@/lib/brand';

async function fetchSubjects() {
  const baseUrl = await resolveBaseUrl();
  const res = await fetch(`${baseUrl}/api/subjects`, { cache: 'no-store' });
  return res.ok ? res.json() : [];
}

export default async function AdminSubjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  const subjects = await fetchSubjects();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-blue-600">Manage Subjects & Chapters</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Client component without server-passed handlers */}
            <AdminSubjectForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Chapter (Topic)</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Client component without server-passed handlers */}
            <AdminTopicForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Subjects</CardTitle>
          </CardHeader>
          <CardContent>
            {!subjects.length ? (
              <p className="text-sm text-gray-500">No subjects yet.</p>
            ) : (
              <div className="space-y-3">
                {subjects.map((s: any) => (
                  <div key={s._id} className="p-3 border rounded-lg">
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-sm text-gray-500">Category: {s.category}</div>
                    <div className="text-sm text-gray-500">Levels: {(s.levels || []).map((l: any) => l.name).join(', ')}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


