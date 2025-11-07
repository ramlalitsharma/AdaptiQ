import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDatabase } from '@/lib/mongodb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { SiteBrand } from '@/components/layout/SiteBrand';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Badge } from '@/components/ui/Badge';
import { requireAdmin } from '@/lib/admin-check';
import { WorkflowControls } from '@/components/admin/WorkflowControls';

export const dynamic = 'force-dynamic';

export default async function AdminBlogsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  try {
    await requireAdmin();
  } catch {
    redirect('/dashboard');
  }

  let blogs: any[] = [];
  try {
    const db = await getDatabase();
    blogs = await db.collection('blogs').find({}).sort({ createdAt: -1 }).limit(100).toArray();
  } catch (e) {
    console.error('Blogs fetch error:', e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/admin">
              <Button variant="outline" size="sm">← Admin Panel</Button>
            </Link>
            <Link href="/admin/studio">
              <Button size="sm">+ Create Blog</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Blog Management</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage all blog posts and content</p>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total: {blogs.length} posts
          </div>
        </div>

        {blogs.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No blog posts yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first blog post to get started</p>
              <Link href="/admin/studio">
                <Button>Create Blog</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog: any) => {
              const publishedDate = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'N/A';
              
              return (
                <Card key={blog._id} className="h-full hover:shadow-lg transition-shadow">
                  {blog.coverImage && (
                    <div className="aspect-video bg-gray-200 rounded-t-xl overflow-hidden">
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant={blog.status === 'published' ? 'success' : 'default'}>
                        {blog.status || 'draft'}
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {publishedDate}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                      {blog.excerpt || blog.content?.slice(0, 150) || 'No content'}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/blog/${blog.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">View</Button>
                      </Link>
                      <Button variant="outline" size="sm">Edit</Button>
                    </div>
                    <div className="mt-4">
                      <WorkflowControls
                        contentType="blog"
                        contentId={blog.slug}
                        status={blog.status || 'draft'}
                        updatedAt={blog.workflowUpdatedAt ? new Date(blog.workflowUpdatedAt).toISOString() : undefined}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

