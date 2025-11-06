import Link from 'next/link';
import { getDatabase } from '@/lib/mongodb';
import { SiteBrand } from '@/components/layout/SiteBrand';

export const dynamic = 'force-dynamic';

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: any = null;
  try {
    const db = await getDatabase();
    post = await db.collection('blogs').findOne({ slug });
  } catch (error) {
    console.error('Error fetching blog post:', error);
  }
  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-2">Post not found</h1>
        <Link href="/blog" className="text-blue-600 hover:underline">← Back to Blog</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <SiteBrand />
          <Link href="/blog" className="text-blue-600 hover:underline">← Blog</Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <article className="max-w-3xl mx-auto bg-white border rounded-xl p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{post.title}</h1>
          <p className="text-sm text-gray-500 mb-4">{new Date(post.createdAt).toLocaleString()}</p>
          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt={post.title} className="w-full rounded-lg mb-6" />
          )}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: markedToHtml(post.markdown || '') }} />
        </article>
      </main>
    </div>
  );
}

function markedToHtml(md: string) {
  // very light markdown to HTML (headings and paragraphs)
  const lines = md.split('\n');
  return lines
    .map((l) => {
      if (l.startsWith('### ')) return `<h3>${escapeHtml(l.slice(4))}</h3>`;
      if (l.startsWith('## ')) return `<h2>${escapeHtml(l.slice(3))}</h2>`;
      if (l.startsWith('# ')) return `<h1>${escapeHtml(l.slice(2))}</h1>`;
      if (!l.trim()) return '';
      return `<p>${escapeHtml(l)}</p>`;
    })
    .join('');
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


