'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
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
  Search,
  MapPinned,
  Landmark,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs-primitive';

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

type ProportionalPartyResult = {
  name: string;
  votes: number | null;
  percentage?: string | null;
  seats?: number | null;
};

type AreaDetailResult = {
  area: string;
  province?: string | null;
  district?: string | null;
  winner?: string | null;
  party?: string | null;
  status?: string | null;
  votes?: number | null;
};

type ExplorerSection<T> = {
  available: boolean;
  pageUrl: string;
  source: string;
  itemCount: number;
  items: T[];
  rawSnippets: string[];
  error?: string;
};

type LookupOption = {
  id: number;
  name: string;
  parentId?: number;
};

type ConstituencyLookup = {
  distId: number;
  consts: number;
};

type PrExplorerResult = {
  SerialNo: number;
  PartyID: number;
  SymbolID: number;
  SymbolName: string;
  PoliticalPartyName: string;
  DistrictCd: number;
  DistrictName: string | null;
  StateID: number;
  SCConstID: number;
  CenterConstID: number;
  OrderID: number;
  TotalVoteReceived: number;
};

type PrExplorerPayload = {
  generatedAt: string;
  selection: {
    stateId: number | null;
    districtId: number | null;
    constituencyId: number | null;
  };
  lookups: {
    states: LookupOption[];
    districts: LookupOption[];
    constituencies: ConstituencyLookup[];
  };
  results: PrExplorerResult[];
  source: string;
  error?: string;
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
  explorer?: {
    proportional: ExplorerSection<ProportionalPartyResult>;
    area: ExplorerSection<AreaDetailResult>;
  };
  sources: SourceHealth[];
  updates: ElectionUpdate[];
  error?: string;
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

function formatNumber(value: number | null | undefined): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

const POLL_MS = 60_000;

function getElectionApiUrls(): string[] {
  if (typeof window === 'undefined') return ['/api/public/election/nepal-live'];
  const base = window.location.origin;
  return [
    `${base}/api/public/election/nepal-live`,
    `${base}/api/election/nepal-live`,
  ];
}

export function NepalElectionLiveBoard() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explorerSearch, setExplorerSearch] = useState('');
  const deferredExplorerSearch = useDeferredValue(explorerSearch.trim().toLowerCase());
  const [prExplorer, setPrExplorer] = useState<PrExplorerPayload | null>(null);
  const [prExplorerLoading, setPrExplorerLoading] = useState(true);
  const [prExplorerError, setPrExplorerError] = useState<string | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number | ''>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | ''>('');
  const [selectedConstituencyId, setSelectedConstituencyId] = useState<number | ''>('');
  const [showMapSurface, setShowMapSurface] = useState(true);

  const fetchData = async () => {
    try {
      setError(null);
      const urls = getElectionApiUrls();
      let res: Response | null = null;
      let text = '';
      for (const url of urls) {
        res = await fetch(url, { cache: 'no-store' });
        if (res.ok || res.status === 500) {
          text = await res.text();
          break;
        }
        if (res.status === 404 && urls.indexOf(url) < urls.length - 1) continue;
        text = await res.text();
        break;
      }
      if (!res) {
        setError('Could not reach election API');
        setLoading(false);
        return;
      }
      const isJson =
        res.headers.get('content-type')?.includes('application/json') ||
        (text.trim().length > 0 && text.trimStart().startsWith('{'));
      let data: Payload | null = null;
      if (isJson) {
        try {
          data = JSON.parse(text) as Payload;
        } catch {
          setError('Invalid response from server. Please try again.');
          setPayload(null);
          setLoading(false);
          return;
        }
      } else {
        setError('Election Commission or server returned a non-data response. Try again later.');
        setPayload(null);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setPayload(data?.official ? data : null);
        setError(data?.error || `Error ${res.status}`);
        return;
      }
      setPayload(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
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

  const loadPrExplorer = async (selection?: {
    stateId?: number;
    districtId?: number;
    constituencyId?: number;
  }) => {
    try {
      setPrExplorerError(null);
      setPrExplorerLoading(true);
      const params = new URLSearchParams();
      if (selection?.stateId) params.set('stateId', String(selection.stateId));
      if (selection?.districtId) params.set('districtId', String(selection.districtId));
      if (selection?.constituencyId) params.set('constituencyId', String(selection.constituencyId));
      const url = `/api/public/election/nepal-pr-explorer${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url, { cache: 'no-store' });
      const data = (await res.json()) as PrExplorerPayload;
      if (!res.ok) {
        setPrExplorer(data);
        setPrExplorerError(data.error || `Explorer request failed (${res.status})`);
        return;
      }
      setPrExplorer(data);
    } catch (e) {
      setPrExplorerError(e instanceof Error ? e.message : 'Failed to load PR explorer');
    } finally {
      setPrExplorerLoading(false);
    }
  };

  useEffect(() => {
    loadPrExplorer();
  }, []);

  useEffect(() => {
    setSelectedDistrictId('');
    setSelectedConstituencyId('');
  }, [selectedStateId]);

  useEffect(() => {
    setSelectedConstituencyId('');
  }, [selectedDistrictId]);

  const parties = useMemo(() => payload?.official?.parties?.slice(0, 8) ?? [], [payload?.official?.parties]);
  const maxParty = useMemo(() => Math.max(...parties.map((p) => p.total), 1), [parties]);
  const updates = useMemo(() => payload?.updates?.slice(0, 16) ?? [], [payload?.updates]);
  const officialAvailable = Boolean(payload?.official?.available);
  const totalSeats = payload?.official?.totalConstituencies ?? 165;
  const seatsCounted = payload?.official?.totalLeadingOrWon ?? 0;
  const electionName = payload?.official?.election ?? 'प्रतिनिधि सभा निर्वाचन, २०८२';
  const proportional = payload?.explorer?.proportional;
  const area = payload?.explorer?.area;
  const filteredProportional = useMemo(() => {
    const items = proportional?.items ?? [];
    if (!deferredExplorerSearch) return items;
    return items.filter((item) =>
      `${item.name} ${item.votes ?? ''} ${item.percentage ?? ''} ${item.seats ?? ''}`
        .toLowerCase()
        .includes(deferredExplorerSearch)
    );
  }, [deferredExplorerSearch, proportional?.items]);
  const filteredArea = useMemo(() => {
    const items = area?.items ?? [];
    if (!deferredExplorerSearch) return items;
    return items.filter((item) =>
      `${item.area} ${item.province ?? ''} ${item.district ?? ''} ${item.winner ?? ''} ${item.party ?? ''} ${item.status ?? ''} ${item.votes ?? ''}`
        .toLowerCase()
        .includes(deferredExplorerSearch)
    );
  }, [area?.items, deferredExplorerSearch]);
  const filteredProportionalSnippets = useMemo(() => {
    const items = proportional?.rawSnippets ?? [];
    if (!deferredExplorerSearch) return items;
    return items.filter((item) => item.toLowerCase().includes(deferredExplorerSearch));
  }, [deferredExplorerSearch, proportional?.rawSnippets]);
  const filteredAreaSnippets = useMemo(() => {
    const items = area?.rawSnippets ?? [];
    if (!deferredExplorerSearch) return items;
    return items.filter((item) => item.toLowerCase().includes(deferredExplorerSearch));
  }, [area?.rawSnippets, deferredExplorerSearch]);
  const stateOptions = prExplorer?.lookups.states ?? [];
  const districtOptions = useMemo(() => {
    const items = prExplorer?.lookups.districts ?? [];
    if (!selectedStateId) return items;
    return items.filter((item) => item.parentId === selectedStateId);
  }, [prExplorer?.lookups.districts, selectedStateId]);
  const constituencyOptions = useMemo(() => {
    if (!selectedDistrictId) return [];
    const count = prExplorer?.lookups.constituencies.find((item) => item.distId === selectedDistrictId)?.consts ?? 0;
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      name: String(index + 1),
    }));
  }, [prExplorer?.lookups.constituencies, selectedDistrictId]);
  const prResults = useMemo(() => {
    const items = prExplorer?.results ?? [];
    if (!deferredExplorerSearch) return items;
    return items.filter((item) =>
      `${item.PoliticalPartyName} ${item.SymbolName} ${item.TotalVoteReceived} ${item.CenterConstID}`.toLowerCase().includes(deferredExplorerSearch)
    );
  }, [deferredExplorerSearch, prExplorer?.results]);
  const prMaxVotes = useMemo(() => Math.max(...prResults.map((item) => item.TotalVoteReceived), 1), [prResults]);
  const selectedStateName = stateOptions.find((item) => item.id === selectedStateId)?.name;
  const selectedDistrictName = districtOptions.find((item) => item.id === selectedDistrictId)?.name;

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
              <>
                {/* Party table: Lead / Win / Total (like reference) */}
                <div className="overflow-x-auto -mx-1">
                  <table className="w-full text-left border-collapse" aria-label="Party-wise results">
                    <thead>
                      <tr className="text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-white/10">
                        <th className="py-2.5 pr-3">पार्टी</th>
                        <th className="py-2.5 pr-3 text-center w-16">अग्रता</th>
                        <th className="py-2.5 pr-3 text-center w-16">जित</th>
                        <th className="py-2.5 pl-3 text-right w-16">कुल सिट</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parties.map((party) => (
                        <tr
                          key={`${party.partyId}-${party.partyName}`}
                          className="border-b border-white/5 hover:bg-white/5"
                        >
                          <td className="py-2.5 pr-3">
                            <span className="text-sm font-bold text-white truncate max-w-[200px] block" title={party.partyName}>
                              {party.partyName}
                            </span>
                            <div
                              className="h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1 max-w-[180px]"
                              role="progressbar"
                              aria-valuenow={party.total}
                              aria-valuemin={0}
                              aria-valuemax={maxParty}
                            >
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-red-600 to-cyan-500 transition-[width] duration-500"
                                style={{ width: `${Math.round((party.total / maxParty) * 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 pr-3 text-center text-sm font-semibold text-slate-300 tabular-nums">
                            {party.leads}
                          </td>
                          <td className="py-2.5 pr-3 text-center text-sm font-semibold text-slate-300 tabular-nums">
                            {party.wins}
                          </td>
                          <td className="py-2.5 pl-3 text-right text-sm font-black text-white tabular-nums">
                            {party.total}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
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
          <div className="p-4 md:p-6 bg-slate-950/80 space-y-6">
            <section className="rounded-[1.6rem] border border-cyan-500/20 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.92))] p-4 md:p-5 shadow-[0_20px_80px_-42px_rgba(34,211,238,0.55)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[0.28em] text-cyan-300">
                    Direct Election Explorer
                  </p>
                  <h2 className="mt-2 text-xl font-black tracking-tight text-white">
                    Search official election views inside our site
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Same upstream source, redesigned into a cleaner local browser for filtering and quick scanning.
                  </p>
                </div>
                <div className="relative w-full md:max-w-sm">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="search"
                    value={explorerSearch}
                    onChange={(e) => setExplorerSearch(e.target.value)}
                    placeholder="Search party, area, district, winner..."
                    className="w-full rounded-2xl border border-white/10 bg-black/25 py-3 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-cyan-400/50"
                  />
                </div>
              </div>

              <Tabs defaultValue="proportional" className="mt-5">
                <TabsList className="h-auto rounded-2xl bg-[#0d1728] p-1.5 border border-white/10">
                  <TabsTrigger
                    value="proportional"
                    className="gap-2 rounded-xl px-4 py-3 text-sm font-bold data-[state=active]:bg-[#3f82c4] data-[state=active]:text-white"
                  >
                    <Landmark size={16} />
                    समानुपातिक
                  </TabsTrigger>
                  <TabsTrigger
                    value="area"
                    className="gap-2 rounded-xl px-4 py-3 text-sm font-bold data-[state=active]:bg-[#3f82c4] data-[state=active]:text-white"
                  >
                    <MapPinned size={16} />
                    क्षेत्रगत विवरण
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="proportional" className="mt-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                          समानुपातिक View
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {proportional?.available
                            ? `${filteredProportional.length || filteredProportionalSnippets.length} results visible`
                            : 'Waiting for official proportional view'}
                        </p>
                      </div>
                      <a
                        href={proportional?.pageUrl || 'https://result.election.gov.np/PRVoteChartResult2082.aspx'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                      >
                        Source page
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,1fr,1fr,auto]">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-200">प्रदेश</span>
                        <select
                          value={selectedStateId}
                          onChange={(e) => setSelectedStateId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                        >
                          <option value="">छान्नुहोस्</option>
                          {stateOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-200">जिल्ला</span>
                        <select
                          value={selectedDistrictId}
                          onChange={(e) => setSelectedDistrictId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                        >
                          <option value="">छान्नुहोस्</option>
                          {districtOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-slate-200">प्रतिनिधि सभा निर्वाचन क्षेत्र नं.</span>
                        <select
                          value={selectedConstituencyId}
                          onChange={(e) => setSelectedConstituencyId(e.target.value ? Number(e.target.value) : '')}
                          className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/50"
                        >
                          <option value="">छान्नुहोस्</option>
                          {constituencyOptions.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            loadPrExplorer({
                              stateId: selectedStateId || undefined,
                              districtId: selectedDistrictId || undefined,
                              constituencyId: selectedConstituencyId || undefined,
                            })
                          }
                          className="w-full rounded-xl bg-[#3f82c4] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#4d90d1]"
                        >
                          Search
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <label className="inline-flex items-center gap-3 text-sm text-slate-300">
                        <span>नक्सा</span>
                        <input
                          type="checkbox"
                          checked={showMapSurface}
                          onChange={(e) => setShowMapSurface(e.target.checked)}
                          className="h-5 w-5 rounded border-white/10 bg-slate-950 text-cyan-400"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setExplorerSearch('')}
                        className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-cyan-400/30 hover:text-white"
                      >
                        Clear filter
                      </button>
                      <span className="text-xs text-slate-500">
                        {prExplorer?.generatedAt ? `Live sync ${formatTime(prExplorer.generatedAt)}` : 'Preparing live sync'}
                      </span>
                    </div>

                    {prExplorerError ? (
                      <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {prExplorerError}
                      </div>
                    ) : null}

                    {showMapSurface ? (
                      <div className="mt-4 rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.18),transparent_58%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.92))] p-5">
                        <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
                          <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Selection Surface</p>
                            <p className="mt-3 text-2xl font-black text-white">
                              {selectedDistrictName || selectedStateName || 'नेपाल'}
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                              {selectedConstituencyId
                                ? `प्रतिनिधि सभा निर्वाचन क्षेत्र नं. ${selectedConstituencyId}`
                                : selectedDistrictName
                                  ? 'जिल्ला स्तर'
                                  : selectedStateName
                                    ? 'प्रदेश स्तर'
                                    : 'राष्ट्रिय अवलोकन'}
                            </p>
                            <div className="mt-5 grid grid-cols-2 gap-3">
                              {stateOptions.map((item) => {
                                const active = item.id === selectedStateId;
                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedStateId(item.id)}
                                    className={`rounded-2xl border px-3 py-4 text-left transition-colors ${
                                      active
                                        ? 'border-cyan-300 bg-cyan-400/15 text-white'
                                        : 'border-white/8 bg-white/5 text-slate-300 hover:border-cyan-400/30'
                                    }`}
                                  >
                                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                      प्रदेश {item.id}
                                    </span>
                                    <span className="mt-1 block text-sm font-semibold">{item.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="rounded-[1.4rem] border border-white/10 bg-black/20 p-5">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Live Result Pulse</p>
                            <div className="mt-4 space-y-3">
                              {(prResults.slice(0, 5)).map((item) => (
                                <div key={`${item.PartyID}-${item.SerialNo}`} className="rounded-xl bg-slate-950/70 px-4 py-3">
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="text-sm font-bold text-white">{item.PoliticalPartyName}</p>
                                      <p className="text-xs text-slate-500">{item.SymbolName}</p>
                                    </div>
                                    <p className="text-sm font-black text-white">{formatNumber(item.TotalVoteReceived)}</p>
                                  </div>
                                  <div className="mt-2 h-2 rounded-full bg-white/5">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                      style={{ width: `${Math.max(8, Math.round((item.TotalVoteReceived / prMaxVotes) * 100))}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                              {!prResults.length && !prExplorerLoading ? (
                                <p className="text-sm text-slate-400">
                                  Search a province, district, or constituency to load the official proportional result JSON.
                                </p>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    {prExplorerLoading ? (
                      <div className="mt-4 space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="rounded-xl border border-white/10 bg-black/15 p-4 animate-pulse">
                            <div className="h-4 w-1/3 rounded bg-white/10" />
                            <div className="mt-3 h-3 w-full rounded bg-white/5" />
                          </div>
                        ))}
                      </div>
                    ) : prResults.length > 0 ? (
                      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
                        <table className="w-full border-collapse text-left">
                          <thead className="bg-slate-950/90 text-[11px] uppercase tracking-widest text-slate-500">
                            <tr>
                              <th className="px-4 py-3">Party</th>
                              <th className="px-4 py-3">Symbol</th>
                              <th className="px-4 py-3 text-right">Votes</th>
                              <th className="px-4 py-3 text-right">Share</th>
                            </tr>
                          </thead>
                          <tbody>
                            {prResults.map((item) => (
                              <tr key={`${item.PartyID}-${item.SerialNo}`} className="border-t border-white/8 bg-black/20">
                                <td className="px-4 py-3">
                                  <p className="font-semibold text-white">{item.PoliticalPartyName}</p>
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-300">{item.SymbolName}</td>
                                <td className="px-4 py-3 text-right font-bold text-white">{formatNumber(item.TotalVoteReceived)}</td>
                                <td className="px-4 py-3 text-right text-sm text-slate-300">
                                  {((item.TotalVoteReceived / prMaxVotes) * 100).toFixed(2)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : filteredProportional.length > 0 ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {filteredProportional.slice(0, 12).map((item) => (
                          <article
                            key={`${item.name}-${item.votes}-${item.seats}`}
                            className="rounded-2xl border border-white/8 bg-black/20 p-4 hover:border-cyan-400/30 transition-colors"
                          >
                            <p className="text-base font-bold text-white">{item.name}</p>
                            <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                              <div className="rounded-xl bg-slate-950/70 px-3 py-2">
                                <p className="text-slate-500">Votes</p>
                                <p className="mt-1 font-bold text-slate-100">{formatNumber(item.votes)}</p>
                              </div>
                              <div className="rounded-xl bg-slate-950/70 px-3 py-2">
                                <p className="text-slate-500">Share</p>
                                <p className="mt-1 font-bold text-slate-100">{item.percentage || '—'}</p>
                              </div>
                              <div className="rounded-xl bg-slate-950/70 px-3 py-2">
                                <p className="text-slate-500">Seats</p>
                                <p className="mt-1 font-bold text-slate-100">{formatNumber(item.seats)}</p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : filteredProportionalSnippets.length > 0 ? (
                      <div className="mt-4 grid gap-2">
                        {filteredProportionalSnippets.slice(0, 18).map((line, idx) => (
                          <div key={`${line}-${idx}`} className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300">
                            {line}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center">
                        <p className="text-sm text-slate-400">
                          Official proportional data is not readable right now. The tab is ready and will populate as soon as the upstream view returns structured content.
                        </p>
                        {proportional?.error ? (
                          <p className="mt-2 text-xs text-red-300">{proportional.error}</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="area" className="mt-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">
                          क्षेत्रगत विवरण View
                        </h3>
                        <p className="mt-1 text-xs text-slate-400">
                          {area?.available
                            ? `${filteredArea.length || filteredAreaSnippets.length} entries visible`
                            : 'Waiting for official area-wise detail view'}
                        </p>
                      </div>
                      <a
                        href={area?.pageUrl || 'https://result.election.gov.np/PRMapElectionResult2082.aspx'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200"
                      >
                        Source page
                        <ExternalLink size={12} />
                      </a>
                    </div>

                    {filteredArea.length > 0 ? (
                      <div className="mt-4 grid gap-3">
                        {filteredArea.slice(0, 14).map((item, idx) => (
                          <article
                            key={`${item.area}-${item.winner}-${idx}`}
                            className="rounded-2xl border border-white/8 bg-black/20 p-4 hover:border-cyan-400/30 transition-colors"
                          >
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="text-base font-bold text-white">{item.area}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {[item.province, item.district].filter(Boolean).join(' • ') || 'Official area detail'}
                                </p>
                              </div>
                              <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-200">
                                {item.status || 'Live'}
                              </span>
                            </div>
                            <div className="mt-3 grid gap-2 md:grid-cols-3 text-sm">
                              <div className="rounded-xl bg-slate-950/70 px-3 py-2">
                                <p className="text-xs text-slate-500">Winner / Lead</p>
                                <p className="mt-1 font-semibold text-slate-100">{item.winner || '—'}</p>
                              </div>
                              <div className="rounded-xl bg-slate-950/70 px-3 py-2">
                                <p className="text-xs text-slate-500">Party</p>
                                <p className="mt-1 font-semibold text-slate-100">{item.party || '—'}</p>
                              </div>
                              <div className="rounded-xl bg-slate-950/70 px-3 py-2">
                                <p className="text-xs text-slate-500">Votes / Signal</p>
                                <p className="mt-1 font-semibold text-slate-100">{formatNumber(item.votes)}</p>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    ) : filteredAreaSnippets.length > 0 ? (
                      <div className="mt-4 grid gap-2">
                        {filteredAreaSnippets.slice(0, 18).map((line, idx) => (
                          <div key={`${line}-${idx}`} className="rounded-xl border border-white/8 bg-black/20 px-4 py-3 text-sm text-slate-300">
                            {line}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-white/10 bg-black/15 px-4 py-8 text-center">
                        <p className="text-sm text-slate-400">
                          Official area-wise details are not readable right now. The local explorer is in place and will surface them automatically when the upstream page responds with parseable content.
                        </p>
                        {area?.error ? (
                          <p className="mt-2 text-xs text-red-300">{area.error}</p>
                        ) : null}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </section>

            <section>
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
            </section>
          </div>
        </div>

        {/* Summary cards: कुल सिट, पार्टीहरू, सिट गणना */}
        {!loading && (payload?.official || parties.length > 0) && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-6 py-4 border-t border-white/10 bg-black/20">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">कुल सिट</p>
              <p className="text-xl font-black text-white tabular-nums mt-0.5">{totalSeats}</p>
              <p className="text-[10px] text-slate-500">प्रतिनिधि सभा</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">गणना भएको</p>
              <p className="text-xl font-black text-white tabular-nums mt-0.5">{seatsCounted}</p>
              <p className="text-[10px] text-slate-500">सिट गणना</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">पार्टीहरू</p>
              <p className="text-xl font-black text-white tabular-nums mt-0.5">{parties.length}</p>
              <p className="text-[10px] text-slate-500">पार्टी तालिका</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-slate-900/60 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">अपडेट</p>
              <p className="text-lg font-bold text-slate-300 tabular-nums mt-0.5">
                {payload?.generatedAt ? formatTime(payload.generatedAt) : '—'}
              </p>
              <p className="text-[10px] text-slate-500">60s अटो-रिफ्रेस</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
