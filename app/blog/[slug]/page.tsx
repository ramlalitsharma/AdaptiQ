'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, CheckCircle, ChevronLeft } from 'lucide-react';
import { BlogComments } from '@/components/blog/BlogComments';

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/public/blogs/${slug}`); // I need to verify if this endpoint exists
        const data = await res.json();
        setPost(data.post);
      } catch (err) {
        console.error('Failed to fetch post:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

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

  const imageUrl = post.coverImage || post.metadata?.heroImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80';

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-500 z-[100] origin-left"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <header className="relative w-full h-[70vh] flex items-end justify-start overflow-hidden">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img src={imageUrl} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        </motion.div>

        <div className="container mx-auto px-4 pb-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="max-w-4xl space-y-6"
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-indigo-400 font-medium pb-4 hover:gap-4 transition-all"
            >
              <ChevronLeft className="w-5 h-5" /> All Stories
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg border border-white/10 text-white">
                <Clock className="w-4 h-4" />
                <span>8 min read</span>
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {post.title}
            </h1>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 -mt-10 pb-32">
        <div className="grid lg:grid-cols-[1fr,minmax(0,100px)] gap-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-3xl mx-auto w-full"
          >
            <article className="prose prose-invert prose-indigo lg:prose-xl max-w-none">
              <div
                className="blog-content-view"
                dangerouslySetInnerHTML={{ __html: markedToHtml(post.markdown || '') }}
              />
            </article>

            {/* Author Section */}
            <div className="mt-20 pt-12 border-t border-slate-800 flex flex-col md:flex-row items-center gap-8 bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
                {post.authorId?.slice(0, 1) || 'A'}
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h4 className="text-xl font-bold text-white">Editorial Board</h4>
                  <CheckCircle className="w-5 h-5 text-indigo-400" />
                </div>
                <p className="text-slate-400">
                  This article was authored and vetted by the AdaptIQ editorial team, focusing on delivering data-driven insights and pedagogical excellence for our global community of learners.
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                  <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
                    <Bookmark className="w-4 h-4" /> Save
                  </button>
                  <button className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <BlogComments blogSlug={slug as string} />
          </motion.div>

          {/* Sticky Sidebar (Empty for now but layout-ready) */}
          <aside className="hidden lg:block">
            {/* Future Table of Contents or Ad Space */}
          </aside>
        </div>
      </main>

      <style jsx global>{`
        .blog-content-view h1,
        .blog-content-view h2,
        .blog-content-view h3 {
          color: white;
          font-weight: 800;
          letter-spacing: -0.02em;
          margin-top: 2.5rem !important;
          margin-bottom: 1.25rem !important;
        }
        .blog-content-view h2 { font-size: 2.25rem; }
        .blog-content-view h3 { font-size: 1.75rem; }
        .blog-content-view p {
          color: #94a3b8;
          line-height: 1.8;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .blog-content-view ul {
          margin-bottom: 2rem;
          padding-left: 1.5rem;
        }
        .blog-content-view li {
          color: #94a3b8;
          margin-bottom: 0.75rem;
          font-size: 1.2rem;
        }
        .blog-content-view strong {
          color: white;
        }
      `}</style>
    </div>
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



