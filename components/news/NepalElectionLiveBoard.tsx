'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock3,
  ExternalLink,
  RadioTower,
  RefreshCw,
  Activity,
  CheckCircle2,
  AlertCircle as AlertCircleIcon,
  XCircle,
} from 'lucide-react';

type SourceHealth = {
  key: string;
  name: string;
  url: string;
  status: 'ok' | 'degraded' | 'offline';
  itemCount: number;
  lastSync: string;
  error?: string;
};

type ElectionUpdate = {
  title: string;
  link: string;
  summary: string;
  publishedAt: string;
  source: string;
};

type OfficialPartyTally = {
  partyId: number;
  partyName: string;
  wins: number;
  leads: number;
  total: number;
  symbolId?: number;
};

type Payload = {
  generatedAt: string;
  official: {
    election: string;
    source: string;
    available: boolean;
    totalConstituencies: number;
    totalLeadingOrWon: number;
    parties: OfficialPartyTally[];
  };
  sources: SourceHealth[];
  updates: ElectionUpdate[];
};

const statusConfig: Record<
  SourceHealth['status'],
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  ok: {
    label: 'Live',
    className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: CheckCircle2,
  },
  degraded: {
    label: 'Degraded',
    className: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: AlertCircleIcon,
  },
  offline: {
    label: 'Offline',
    className: 'text-red-400 bg-red-500/10 border-red-500/30',
    icon: XCircle,
  },
};

function formatTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const API_URL = '/api/public/election/nepal-live';
const POLL_MS = 60_000;

export function NepalElectionLiveBoard() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await fetch(API_URL, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setPayload(data?.official ? data : null);
        setError(data?.error || `Error ${res.status}`);
        return;
      }
      setPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  const parties = useMemo(() => payload?.official?.parties?.slice(0, 8) ?? [], [payload?.official?.parties]);
  const maxParty = useMemo(() => Math.max(...parties.map((p) => p.total), 1), [parties]);
  const updates = useMemo(() => payload?.updates?.slice(0, 16) ?? [], [payload?.updates]);
  const officialAvailable = Boolean(payload?.official?.available);
  const totalSeats = payload?.official?.totalConstituencies ?? 165;
  const seatsCounted = payload?.official?.totalLeadingOrWon ?? 0;
  const electionName = payload?.official?.election ?? 'प्रतिनिधि सभा निर्वाचन, २०८२';

  return (
    <div className="px-4 md:px-6 2xl:px-8 max-w-[1600px] mx-auto">
      {/* Main card */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/90 to-slate-950/95 shadow-2xl shadow-black/40 overflow-hidden">
        {/* Top bar: Live badge + last updated */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 md:px-6 py-3.5 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
              </span>
              Live
            </span>
            <span className="text-xs font-medium text-slate-400">
              {officialAvailable ? 'Official tally + media feed' : 'Media feed only'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 size={14} />
            <span aria-live="polite">
              Updated {payload?.generatedAt ? formatTime(payload.generatedAt) : '…'}
            </span>
            <span className="text-slate-600" title="Data refreshes automatically">· Auto-refresh 60s</span>
          </div>
        </div>

        {/* Unavailable banner */}
        {!loading && !officialAvailable && (
          <div
            className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-200 text-sm"
            role="alert"
          >
            <AlertTriangle size={18} className="shrink-0" />
            <span>
              Official Election Commission tally is temporarily unavailable. Showing source-synced media updates.
            </span>
          </div>
        )}

        {/* Error + retry */}
        {error && (
          <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 py-3 bg-red-500/10 border-b border-red-500/20 text-red-200 text-sm">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                fetchData();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold text-xs px-3 py-1.5 transition-colors"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,400px),1fr]">
          {/* Left: Official Party Tally */}
          <div className="p-4 md:p-6 border-b xl:border-b-0 xl:border-r border-white/10 bg-slate-900/50">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white mb-1">
              Official Party Tally
            </h2>
            <p className="text-xs text-slate-400 mb-1" aria-live="polite">
              {electionName} • {loading ? '…' : `${seatsCounted} / ${totalSeats} seats counted`}
            </p>
            <p className="text-[10px] text-slate-500 mb-4">
              Source: Election Commission of Nepal (result.election.gov.np) — live fetch
            </p>

            {loading && !parties.length && (
              <div className="space-y-5" aria-busy="true">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-4/5 mb-2" />
                    <div className="h-3 bg-white/10 rounded-full" />
                    <div className="h-3 bg-white/5 rounded w-1/2 mt-2" />
                  </div>
                ))}
              </div>
            )}

            {!loading && !parties.length && !error && (
              <p className="text-sm text-slate-500 py-4">
                No official tally data available. Check back later or view the live media feed.
              </p>
            )}

            {parties.length > 0 && (
              <ul className="space-y-5" role="list" aria-label="Party results">
                {parties.map((party) => (
                  <li key={`${party.partyId}-${party.partyName}`}>
                    <div className="flex items-baseline justify-between gap-2 mb-1.5">
                      <span className="text-sm font-bold text-white truncate" title={party.partyName}>
                        {party.partyName}
                      </span>
                      <span className="text-sm font-black text-white tabular-nums shrink-0">
                        {party.total}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-2">
                      Wins: <strong className="text-slate-300">{party.wins}</strong>
                      {' · '}
                      Leads: <strong className="text-slate-300">{party.leads}</strong>
                    </p>
                    <div
                      className="h-3 rounded-full bg-slate-800 overflow-hidden"
                      role="progressbar"
                      aria-valuenow={party.total}
                      aria-valuemin={0}
                      aria-valuemax={maxParty}
                      aria-label={`${party.partyName}: ${party.total} seats`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-red-600 via-red-500 to-cyan-500 transition-[width] duration-700 ease-out"
                        style={{ width: `${Math.round((party.total / maxParty) * 100)}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* Source Health */}
            {(payload?.sources?.length ?? 0) > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                  Source Health
                </h3>
                <div className="space-y-2">
                  {payload!.sources.map((source) => {
                    const config = statusConfig[source.status];
                    const Icon = config.icon;
                    return (
                      <a
                        key={source.key}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 border transition-colors hover:border-white/20 ${config.className}`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{source.name}</p>
                          <p className="text-[10px] text-slate-500">{source.itemCount} items</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide shrink-0">
                          <Icon size={12} />
                          {config.label}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: Latest Election Updates */}
          <div className="p-4 md:p-6 bg-slate-950/80">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                Latest Election Updates
              </h2>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                <RadioTower size={12} />
                Live Feed · RSS
              </span>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 custom-scrollbar">
              {updates.map((item, idx) => (
                <a
                  key={`${item.link}-${idx}`}
                  href={item.link}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-white/10 bg-slate-900/60 p-4 hover:border-red-500/40 hover:bg-slate-900/80 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                      {item.source}
                    </span>
                    <time className="text-[10px] text-slate-500 tabular-nums" dateTime={item.publishedAt}>
                      {formatDateTime(item.publishedAt)}
                    </time>
                  </div>
                  <p className="text-[15px] font-semibold text-white leading-snug group-hover:text-red-50 transition-colors">
                    {item.title}
                  </p>
                  {item.summary ? (
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                  ) : null}
                  <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-cyan-400/90 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    Open source
                    <ExternalLink size={10} />
                  </span>
                </a>
              ))}
              {!updates.length && !loading && (
                <div className="rounded-xl border border-white/10 bg-slate-900/40 p-6 text-center">
                  <Activity size={32} className="mx-auto text-slate-600 mb-2" />
                  <p className="text-sm text-slate-500">
                    No election updates from configured sources right now. Check back shortly.
                  </p>
                </div>
              )}
              {loading && !updates.length && (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border border-white/10 bg-slate-900/40 p-4 animate-pulse">
                      <div className="h-3 bg-white/10 rounded w-1/4 mb-3" />
                      <div className="h-4 bg-white/10 rounded w-full mb-2" />
                      <div className="h-3 bg-white/5 rounded w-3/4" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
