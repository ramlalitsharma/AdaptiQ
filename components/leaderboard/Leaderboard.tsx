'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  quizzes: number;
  streak: number;
  avatar?: string;
}

interface LeaderboardProps {
  entries?: LeaderboardEntry[]; // must be real data fetched from API/DB
}

export function Leaderboard({ entries = [] }: LeaderboardProps) {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-500';
    if (rank === 2) return 'text-gray-400';
    if (rank === 3) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-purple/10 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />

      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Peer Benchmarking</h2>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Neural Standings</h3>
        </div>
        <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🏆</div>
      </div>

      {!Array.isArray(entries) || entries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No neural data synchronized. Begin assessment cycle.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.rank}
              className={`flex items-center justify-between p-5 rounded-2xl border transition-all hover:translate-x-2 ${entry.rank === 1
                  ? 'bg-elite-accent-cyan/10 border-elite-accent-cyan/20'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
                }`}
            >
              <div className="flex items-center gap-6 flex-1">
                <div className={`text-2xl font-black w-12 text-center ${getRankColor(entry.rank)} font-mono`}>
                  {getRankIcon(entry.rank)}
                </div>
                <div className="flex-1">
                  <div className="font-black text-white uppercase text-sm tracking-widest">{entry.name}</div>
                  <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-4 mt-2">
                    <span>{entry.quizzes} Cycles</span>
                    {entry.streak > 0 && (
                      <span className="text-elite-accent-cyan">
                        🔥 {entry.streak} Day Pulse
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-white font-mono">{entry.score}%</div>
                <div className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">
                  Sync Rank {entry.rank}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center pt-6 border-t border-white/5">
        <Link href="/leaderboard" className="text-[10px] font-black uppercase tracking-[0.2em] text-elite-accent-cyan hover:glow-cyan transition-all">
          Expand Global Network →
        </Link>
      </div>
    </div>
  );
}
