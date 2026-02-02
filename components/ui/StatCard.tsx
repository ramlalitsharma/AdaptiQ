import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color = 'blue', trend }) => {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-50 to-indigo-50 border-blue-100',
    green: 'from-green-50 to-emerald-50 border-green-100',
    purple: 'from-purple-50 to-fuchsia-50 border-purple-100',
    orange: 'from-orange-50 to-amber-50 border-orange-100',
    red: 'from-red-50 to-rose-50 border-red-100',
  };
  const valueColor: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };
  return (
    <div className="glass-card-premium rounded-[2rem] p-6 border border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-elite-accent-cyan/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700" />
      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-2">{title}</div>
          <div className="text-4xl font-black text-white tracking-tighter uppercase">{value}</div>
          {subtitle && (
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">
              {subtitle}
            </div>
          )}
          {trend && (
            <div className="mt-3 inline-flex items-center rounded-lg bg-elite-accent-cyan/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-elite-accent-cyan border border-elite-accent-cyan/20">
              {trend} Telemetry
            </div>
          )}
        </div>
        {icon && (
          <div className="text-4xl grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-500 opacity-50 group-hover:opacity-100">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};


