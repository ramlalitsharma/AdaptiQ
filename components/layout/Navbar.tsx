'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { SiteBrand } from './SiteBrand';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { NotificationBell } from '@/components/notifications/NotificationBell';

export function Navbar() {
  const pathname = usePathname();
  const [allowAdmin, setAllowAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch('/api/admin/status')
      .then((res) => res.json())
      .then((data) => {
        if (mounted) setAllowAdmin(data?.isAdmin === true);
      })
      .catch(() => setAllowAdmin(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-full border border-white/60 dark:border-white/10 bg-white/75 dark:bg-slate-900/70 backdrop-blur-xl shadow-lg shadow-blue-500/5 px-5 sm:px-6 py-3 transition-all">
            <SiteBrand />
            
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
            <Link 
              href="/courses" 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname === '/courses' 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📚 Courses
            </Link>
            <Link 
              href="/subjects" 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname?.startsWith('/subjects') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📖 Subjects
            </Link>
            <Link 
              href="/exams" 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname?.startsWith('/exams') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📝 Exams
            </Link>
            <Link 
              href="/preparations" 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname?.startsWith('/preparations') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🎯 Preparations
            </Link>
            <Link 
              href="/exams" 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname?.includes('international') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              🌍 International
            </Link>
            <Link 
              href="/blog" 
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
                pathname?.startsWith('/blog') 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              📰 Blog
            </Link>
          </nav>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <SignedIn>
                <div className="flex items-center gap-3">
                  <NotificationBell />
                  <Link href="/my-learning">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                      My Learning
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                      Dashboard
                    </Button>
                  </Link>
                  {allowAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                        Admin
                      </Button>
                    </Link>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <Button variant="outline" size="sm">Sign In</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button size="sm">Get Started</Button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>

          <div className="hidden lg:block w-full max-w-xl self-center">
            <div className="rounded-full border border-white/40 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 px-4 py-2 shadow-lg shadow-blue-500/5 backdrop-blur-2xl">
              <GlobalSearch />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

