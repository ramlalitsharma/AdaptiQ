import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';

export function SiteBrand({ variant = 'default', className = '' }: { variant?: 'default' | 'light' | 'dark'; className?: string }) {
  const base = 'text-2xl font-bold';
  const color =
    variant === 'light'
      ? 'text-white'
      : variant === 'dark'
      ? 'text-slate-900 dark:text-white'
      : 'text-blue-600 hover:text-blue-700';
  return (
    <Link href="/" className={`${base} ${color} ${className}`}>
      {BRAND_NAME}
    </Link>
  );
}


