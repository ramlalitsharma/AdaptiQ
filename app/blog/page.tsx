'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight, BookOpen, Search, ArrowUpRight } from 'lucide-react';

// Use a separate server component for data fetching if needed, or keep it client-side with an effect for now 
// to ensure animations and interactivity are smooth. However, the original was server-side.
// I'll stick to client-side for the "WOW" factor with animations, or I can use a Hybrid approach.
// Given the user wants "World Class", I'll use a polished client-side experience.

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/public/blogs');
        const data = await res.json();
        setPosts(data.posts || []);
        setFilteredPosts(data.posts || []);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    const results = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredPosts(results);
  }, [searchTerm, posts]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-indigo-500/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/5 blur-[120px] rounded-full" />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium tracking-wide">
              The Insight Engine
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Stay ahead with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-blue-400">AdaptIQ Insights</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
              Expert analysis, deep dives, and the latest news in adaptive learning and AI-driven education.
            </p>

            <div className="flex items-center justify-center pt-8">
              <div className="relative w-full max-w-lg group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Search articles, topics, resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 backdrop-blur-xl transition-all"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="container mx-auto px-4 pb-32">
        {!filteredPosts.length ? (
          <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl">
            <p className="text-slate-500 text-lg italic">No articles found matching "{searchTerm}". Try a different topic.</p>
          </div>
        ) : (
          <div className="space-y-24">
            {/* Featured Post */}
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Link href={`/blog/${featuredPost.slug}`} className="block group">
                  <div className="grid lg:grid-cols-2 gap-8 items-center bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden hover:border-indigo-500/30 transition-all duration-500 p-4">
                    <div className="relative aspect-[16/10] lg:aspect-auto h-full rounded-[2rem] overflow-hidden">
                      <img
                        src={featuredPost.coverImage || featuredPost.metadata?.heroImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80'}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/80 to-transparent" />
                      <div className="absolute bottom-6 left-6 flex gap-2">
                        {featuredPost.tags?.map((tag: string) => (
                          <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-medium text-white border border-white/10">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="p-8 lg:p-12 space-y-6">
                      <div className="flex items-center gap-4 text-sm text-slate-500 font-medium uppercase tracking-widest">
                        <span>Featured Editorial</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                        <span>{new Date(featuredPost.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <h2 className="text-4xl md:text-5xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-[1.1]">
                        {featuredPost.title}
                      </h2>

                      <p className="text-lg text-slate-400 line-clamp-3 leading-relaxed">
                        {featuredPost.excerpt || "Explore the future of intelligence with our latest deep dive into adaptive learning models and the ethical frameworks shaping tomorrow's education."}
                      </p>

                      <div className="pt-6 flex items-center gap-6">
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold group-hover:gap-4 transition-all">
                          Read Full Article <ArrowUpRight className="w-5 h-5" />
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>8 min read</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* Grid Posts */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
              {remainingPosts.map((post: any, idx: number) => (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`} className="flex flex-col h-full group bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-500/30 transition-all">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img
                        src={post.coverImage || post.metadata?.heroImage || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80'}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-[#020617]/60 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-400 border border-indigo-500/20">
                          {post.tags?.[0] || 'Article'}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col flex-1 space-y-4">
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      </div>

                      <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">
                        {post.excerpt || "Unlock the potential of modern tooling and methodologies to streamline your learning and development path."}
                      </p>

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-800/50">
                        <span className="text-indigo-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read More <ArrowRight className="w-4 h-4" />
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium tracking-wide">
                          <BookOpen className="w-3 h-3" />
                          <span>850 Words</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}



