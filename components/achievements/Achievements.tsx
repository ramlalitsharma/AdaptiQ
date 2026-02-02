'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  category: 'quiz' | 'streak' | 'mastery' | 'social';
}

interface AchievementsProps {
  achievements?: Achievement[]; // must be real data fetched from API/DB
}

export function Achievements({ achievements = [] }: AchievementsProps) {
  return (
    <div className="glass-card-premium rounded-[2.5rem] p-8 border border-white/5 relative overflow-hidden group h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-elite-accent-cyan/10 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700" />

      <div className="flex items-center justify-between mb-10 border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Recognition Ledger</h2>
          <h3 className="text-xl font-black text-white uppercase tracking-widest">Achievement Matrix</h3>
        </div>
        <div className="text-3xl grayscale group-hover:grayscale-0 transition-all">🏅</div>
      </div>

      {!Array.isArray(achievements) || achievements.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">No milestones synchronized. Accelerate output.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-6 rounded-2xl border transition-all relative overflow-hidden group/item ${achievement.unlocked
                  ? 'bg-elite-accent-cyan/5 border-elite-accent-cyan/20'
                  : 'bg-white/5 border-white/5 opacity-60'
                }`}
            >
              <div className="flex items-start gap-4 relative z-10">
                <div className="text-4xl group-hover/item:scale-110 transition-transform duration-500">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-white uppercase text-xs tracking-widest">{achievement.title}</h4>
                    {achievement.unlocked && (
                      <div className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-elite-accent-cyan/20 text-elite-accent-cyan border border-elite-accent-cyan/20">
                        VERIFIED
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight leading-relaxed mb-4">{achievement.description}</p>

                  {!achievement.unlocked && achievement.progress !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-500">
                        <span>Sync Progress</span>
                        <span>{Math.round(((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                        <div
                          className="bg-elite-accent-cyan h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
