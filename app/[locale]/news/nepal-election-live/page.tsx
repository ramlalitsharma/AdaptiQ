import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { NepalElectionLiveBoard } from '@/components/news/NepalElectionLiveBoard';
import { Link } from '@/lib/navigation';
import { getNepalElectionLiveWindow } from '@/lib/nepal-election-live-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nepal Election Live Updates | Terai Times',
  description: 'Official Nepal election tally, live party results, source health, and live media updates. प्रतिनिधि सभा निर्वाचन २०८२.',
  openGraph: {
    title: 'Nepal Election Live Updates | Terai Times',
    description: 'Official Nepal election tally, live party results, and live media updates.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nepal Election Live Updates | Terai Times',
    description: 'Official Nepal election tally, live party results, and live media updates.',
  },
  alternates: { canonical: '/news/nepal-election-live' },
};

export default async function NepalElectionLiveDetailsPage() {
  const windowState = getNepalElectionLiveWindow();
  if (!windowState.enabled) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teraitimes.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: 'Nepal Election Live Updates',
    description: 'Official Nepal election tally, live party results, source health, and live media updates. प्रतिनिधि सभा निर्वाचन २०८२.',
    url: `${baseUrl.replace(/\/$/, '')}/news/nepal-election-live`,
    datePublished: '2026-03-06',
    inLanguage: ['en', 'ne'],
    about: {
      '@type': 'Event',
      name: 'प्रतिनिधि सभा निर्वाचन २०८२',
      description: 'House of Representatives Election, Nepal 2082',
    },
  };

  return (
    <div className="news-page-shell news-paper-theme min-h-screen pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <NewsNavbar />
      <main className="news-viewport pt-6 space-y-4">
        <div className="px-4 md:px-6 2xl:px-8">
          <Link href="/news" className="news-back-link inline-flex items-center gap-2 text-sm font-bold">
            <ArrowLeft size={14} />
            Back to News
          </Link>
        </div>
        <NepalElectionLiveBoard />
      </main>
    </div>
  );
}

