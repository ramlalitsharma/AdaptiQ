import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';

export function SiteBrand({ variant = 'default', className = '' }: { variant?: 'default' | 'light' | 'dark'; className?: string }) {
  const base = 'text-2xl font-black tracking-tighter';
  const color =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
        ? 'text-white'
        : 'text-gradient-cyan hover:scale-105 transition-all';
  return (
    <Link href="/" className={`${base} ${color} ${className} flex items-center gap-2`}>
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-elite-accent-cyan opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-elite-accent-cyan"></span>
      </span>
      {BRAND_NAME}
    </Link>
  );
}


