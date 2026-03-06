import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NewsNavbar } from '@/components/layout/NewsNavbar';
import { NepalElectionLiveBoard } from '@/components/news/NepalElectionLiveBoard';
import { Link } from '@/lib/navigation';
import { getNepalElectionLiveWindow } from '@/lib/nepal-election-live-config';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Nepal Election Live Updates | Terai Times',
  description: 'Official Nepal election tally, live party results, source health, and live media updates. प्रतिनिधि सभा निर्वाचन २०८२.',
  keywords: [
    'Nepal election live',
    'Nepal election 2082',
    'प्रतिनिधि सभा निर्वाचन',
    'HoR election Nepal',
    'election results Nepal',
    'live election tally',
    'Election Commission Nepal',
    'party tally Nepal',
  ],
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
  alternates: {
    canonical: '/news/nepal-election-live',
    languages: { 'en': '/en/news/nepal-election-live', 'ne': '/ne/news/nepal-election-live' },
  },
  robots: { index: true, follow: true },
};

export default async function NepalElectionLiveDetailsPage() {
  const windowState = getNepalElectionLiveWindow();
  if (!windowState.enabled) notFound();

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://teraitimes.com';
  const canonicalUrl = `${baseUrl.replace(/\/$/, '')}/news/nepal-election-live`;

  const reportJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Report',
    name: 'Nepal Election Live Updates',
    description: 'Official Nepal election tally, live party results, source health, and live media updates. प्रतिनिधि सभा निर्वाचन २०८२.',
    url: canonicalUrl,
    datePublished: '2026-03-06',
    dateModified: new Date().toISOString(),
    inLanguage: ['en', 'ne'],
    author: { '@type': 'Organization', name: 'Terai Times' },
    publisher: { '@type': 'Organization', name: 'Terai Times' },
    about: {
      '@type': 'Event',
      name: 'प्रतिनिधि सभा निर्वाचन २०८२',
      description: 'House of Representatives Election, Nepal 2082',
    },
    mainEntity: {
      '@type': 'WebPage',
      name: 'Nepal Election Live',
      url: canonicalUrl,
    },
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'News', item: `${baseUrl.replace(/\/$/, '')}/news` },
      { '@type': 'ListItem', position: 2, name: 'Nepal Election Live', item: canonicalUrl },
    ],
  };

  return (
    <div className="nepal-election-live-page min-h-screen bg-[#0a0e17] font-sans antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <NewsNavbar />
      <main className="pt-2 pb-20">
        {/* Hero + breadcrumb */}
        <div className="px-4 md:px-6 2xl:px-8 pt-4 pb-2">
          <nav aria-label="Breadcrumb" className="mb-4">
            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <span aria-hidden="true">←</span>
              Back to News
            </Link>
          </nav>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Nepal Election Live
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                प्रतिनिधि सभा निर्वाचन, २०८२ — Official tally, live media &amp; source health
              </p>
            </div>
          </div>
        </div>
        <NepalElectionLiveBoard />
        {/* Data & transparency — Ads and editorial compliance */}
        <footer className="px-4 md:px-6 2xl:px-8 max-w-[1600px] mx-auto mt-8 pb-8">
          <section
            className="rounded-xl border border-white/10 bg-slate-900/50 p-4 md:p-5 text-xs text-slate-400"
            aria-label="Data sources and transparency"
          >
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
              Data &amp; transparency
            </h2>
            <p className="mb-2">
              <strong className="text-slate-300">Official tally</strong> is fetched live from the Election Commission of Nepal (
              <a href="https://result.election.gov.np" target="_blank" rel="noreferrer noopener" className="text-cyan-400 hover:underline">result.election.gov.np</a>
              ). <strong className="text-slate-300">Live feed</strong> items are from third-party RSS sources (e.g. Onlinekhabar, Ekantipur), filtered for election-related content. This page auto-refreshes every 60 seconds. Terai Times is not affiliated with the Election Commission. For advertising and sourcing policies, see our{' '}
              <Link href="/news/disclosures" className="text-cyan-400 hover:underline">Disclosures</Link>.
            </p>
          </section>
        </footer>
      </main>
    </div>
  );
}
