import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { SiteBrand } from '@/components/layout/SiteBrand';

export const dynamic = 'force-dynamic';

export default async function BlogIndexPage() {
  let posts: any[] = [];
  try {
    const db = await getDatabase();
    const now = new Date();
    posts = await db
      .collection('blogs')
      .find({ expiresAt: { $gt: now } })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Return empty array on error - page will show "No posts yet"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href="/" className="text-blue-600 hover:underline">← Home</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Latest Blogs</h1>
        {!posts.length ? (
          <p className="text-gray-600">No posts yet. Please check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p: any) => (
              <Link key={p._id} href={`/blog/${p.slug}`}>
                <div className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-semibold text-gray-900">{p.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}


