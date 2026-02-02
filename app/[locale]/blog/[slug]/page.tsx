import React from 'react';
import { getDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { BlogPostClient } from '@/components/blog/BlogPostClient';
import { BRAND_URL } from '@/lib/brand';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdBlockerDetector } from '@/components/ads/AdBlockerDetector';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDatabase();
  const post = await db.collection('blogs').findOne({ slug, status: 'published' });

  const baseUrl = BRAND_URL;

  if (!post) {
    return {
      title: 'Post Not Found',
      alternates: { canonical: `${baseUrl}/blog/${slug}` },
    };
  }

  return {
    title: post.title,
    description: post.excerpt || post.title,
    alternates: { canonical: `${baseUrl}/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
    }
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await getDatabase();
  const post = await db.collection('blogs').findOne({ slug, status: 'published' });

  if (!post) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Post not found</h1>
        <p className="text-slate-400 mb-8">The article you are looking for has been moved or archived.</p>
        <Link href="/blog" className="flex items-center gap-2 text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back to Blog
        </Link>
      </div>
    );
  }

  // Serialize post for client
  const serializedPost = JSON.parse(JSON.stringify(post));

  return (
    <AdBlockerDetector>
      <BlogPostClient post={serializedPost} slug={slug}>
        <div
          className="blog-content-view"
          dangerouslySetInnerHTML={{ __html: markedToHtml(post.markdown || '') }}
        />
      </BlogPostClient>
    </AdBlockerDetector>
  );
}

function markedToHtml(md: string) {
  let cleanMd = md.replace(/^---\n[\s\S]*?\n---\n/, '');
  cleanMd = cleanMd.replace(/^```markdown\n/gm, '').replace(/^```\n/gm, '');

  const lines = cleanMd.split('\n');
  let html = '';
  let inList = false;

  lines.forEach((originalLine) => {
    let line = escapeHtml(originalLine);
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');

    const trimmed = originalLine.trim();

    if (trimmed.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${line.slice(2)}</h1>`;
    } else if (trimmed.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${line.slice(3)}</h2>`;
    } else if (trimmed.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${line.slice(4)}</h3>`;
    }
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.slice(2)}</li>`;
    }
    else if (trimmed.match(/^\[PDF:\s*(.*?)\]\((.*?)\)/)) {
      if (inList) { html += '</ul>'; inList = false; }
      const match = trimmed.match(/^\[PDF:\s*(.*?)\]\((.*?)\)/);
      if (match) {
        const title = match[1];
        const url = match[2];
        html += `
          <div class="my-10 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 overflow-hidden">
            <div class="flex items-center justify-between mb-4 px-2">
               <span class="font-bold text-white flex items-center gap-2 text-lg">
                  📄 ${title}
               </span>
               <a href="${url}" target="_blank" class="text-xs px-4 py-2 bg-indigo-600 rounded-full font-bold text-white hover:bg-indigo-500 transition-colors">Download</a>
            </div>
            <iframe src="${url}#toolbar=0" class="w-full h-[600px] rounded-2xl border border-slate-800 bg-white" title="${title}"></iframe>
          </div>
        `;
      }
    }
    else if (trimmed.length > 0) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${line}</p>`;
    } else if (inList) {
      html += '</ul>'; inList = false;
    }
  });

  if (inList) html += '</ul>';
  return html;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
