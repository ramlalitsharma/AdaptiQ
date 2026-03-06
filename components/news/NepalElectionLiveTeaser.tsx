'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, RadioTower, AlertCircle, RefreshCw } from 'lucide-react';

const API_URL = '/api/public/election/nepal-live';
const POLL_MS = 60_000;

type OfficialPartyTally = {
  partyId: number;
  partyName: string;
  wins: number;
  leads: number;
  total: number;
  symbolId?: number;
};

type TeaserPayload = {
  generatedAt?: string;
  disabled?: boolean;
  error?: string;
  official?: {
    election: string;
    source: string;
    available: boolean;
    totalConstituencies: number;
    totalLeadingOrWon: number;
    parties: OfficialPartyTally[];
  };
};

function formatTime(value: string | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function NepalElectionLiveTeaser() {
  const [payload, setPayload] = useState<TeaserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(API_URL, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setPayload(null);
        setError(data?.error || `Request failed (${res.status})`);
        return;
      }
      if (data?.disabled) {
        setPayload(data);
        setError(null);
        return;
      }
      setPayload(data);
      setError(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load election data';
      setError(message);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchData]);

  const official = payload?.official;
  const available = Boolean(official?.available);
  const parties = (official?.parties ?? []).slice(0, 5);
  const maxTotal = Math.max(...parties.map((p) => p.total), 1);
  const totalSeats = official?.totalConstituencies ?? 165;
  const seatsCounted = official?.totalLeadingOrWon ?? 0;
  const electionName = official?.election ?? 'प्रतिनिधि सभा निर्वाचन, २०८२';

  return (
    <section
      className="px-4 md:px-6 2xl:px-8 py-5 border-b border-[var(--news-border,rgba(15,23,42,0.08))]"
      aria-label="Nepal Election Live - Official party tally and coverage"
    >
      <article className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-[#12050a] via-[#1d0a14] to-[#0e1022] p-4 md:p-5 shadow-[0_12px_40px_-20px_rgba(239,68,68,0.5)] overflow-hidden">
        {/* Card header: Live label + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-red-300" aria-hidden="true">
              <RadioTower size={13} className="animate-pulse" aria-hidden="true" />
              Nepal Election Live
            </div>
            <h2 className="mt-2 text-xl md:text-2xl font-black text-white tracking-tight">
              Official tally, live media updates, and deep election coverage
            </h2>
          </div>
          <div className="shrink-0">
            <Link
              href="/news/nepal-election-live"
              className="inline-flex items-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm px-4 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 focus:ring-offset-[#0e1022]"
              aria-label="See full Nepal election live details and party tally"
            >
              See details
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Official Party Tally block */}
        <div className="rounded-xl bg-black/30 border border-white/10 p-4 md:p-5">
          <h3 className="text-sm font-black uppercase tracking-widest text-white mb-1">
            Official Party Tally
          </h3>
          <p className="text-xs text-slate-400 mb-4" aria-live="polite">
            {electionName} • {loading ? '…' : `${seatsCounted} / ${totalSeats} seats counted`}
          </p>

          {error && (
            <div
              className="flex flex-wrap items-center gap-3 rounded-lg bg-red-950/50 border border-red-500/30 px-4 py-3 text-red-200 text-sm"
              role="alert"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => { setLoading(true); fetchData(); }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-3 py-1.5 transition-colors"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {!error && loading && !payload && (
            <div className="space-y-3" aria-busy="true" aria-label="Loading official tally">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-2.5 bg-white/10 rounded-full" />
                </div>
              ))}
            </div>
          )}

          {!error && !loading && (!available || parties.length === 0) && (
            <p className="text-sm text-slate-400">
              Official tally temporarily unavailable. Open full desk for live media updates.
            </p>
          )}

          {!error && !loading && available && parties.length > 0 && (
            <ul className="space-y-4" role="list" aria-label="Party-wise results">
              {parties.map((party) => (
                <li key={`${party.partyId}-${party.partyName}`} className="group">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-bold text-white truncate" title={party.partyName}>
                      {party.partyName}
                    </span>
                    <span className="text-sm font-black text-white tabular-nums shrink-0" aria-label={`${party.total} seats`}>
                      {party.total}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-1.5">
                    Wins: <strong className="text-slate-200">{party.wins}</strong>
                    {' • '}
                    Leads: <strong className="text-slate-200">{party.leads}</strong>
                  </p>
                  <div
                    className="h-2.5 rounded-full bg-slate-800 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={party.total}
                    aria-valuemin={0}
                    aria-valuemax={maxTotal}
                    aria-label={`${party.partyName}: ${party.total} seats`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-500 to-cyan-500 transition-[width] duration-500 ease-out"
                      style={{ width: `${Math.round((party.total / maxTotal) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {payload?.generatedAt && !loading && (
            <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-500" aria-live="polite">
              Updated {formatTime(payload.generatedAt)}
            </p>
          )}
        </div>
      </article>
    </section>
  );
}
