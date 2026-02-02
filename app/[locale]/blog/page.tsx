import React from 'react';
import { getDatabase } from '@/lib/mongodb';
import { Metadata } from 'next';
import { BlogClientList } from '@/components/blog/BlogClientList';
import { BRAND_URL } from '@/lib/brand';
import { AdBlockerDetector } from '@/components/ads/AdBlockerDetector';

export const metadata: Metadata = {
  title: "Blog | AdaptIQ Insights",
  description: "Deep dives into AI pedagogy, adaptive learning, and platform updates.",
  alternates: {
    canonical: `${BRAND_URL}/blog`,
  },
};

export default async function BlogIndexPage() {
  const db = await getDatabase();
  const posts = await db.collection('blogs')
    .find({ status: 'published' })
    .sort({ createdAt: -1 })
    .toArray();

  const serializedPosts = JSON.parse(JSON.stringify(posts));

  return (
    <AdBlockerDetector>
      <BlogClientList initialPosts={serializedPosts} />
    </AdBlockerDetector>
  );
}



