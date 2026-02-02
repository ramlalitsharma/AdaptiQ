"use client";

import { usePathname as useNextPathname, useSearchParams, useRouter as useNextRouter } from "next/navigation";
import { Link, useRouter, usePathname } from "@/lib/navigation";
import { useTranslations } from "next-intl";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { SiteBrand } from "./SiteBrand";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ViewAsSwitcher } from "@/components/admin/ViewAsSwitcher";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { getNavigationForRole, type UserRole } from "@/lib/navigation-config";

export function Navbar() {
  const t = useTranslations('Common');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/admin/status")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setIsSuperAdmin(Boolean(data?.isSuperAdmin || data?.role === "superadmin"));
        setIsPro(Boolean(data?.isPro));

        // Set user role
        if (data?.role && ['superadmin', 'admin', 'teacher', 'student', 'user'].includes(data.role)) {
          setUserRole(data.role as UserRole);
        } else {
          setUserRole('user');
        }
      })
      .catch(() => {
        if (mounted) {
          setIsSuperAdmin(false);
          setIsPro(false);
          setUserRole('user');
        }
      });

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const viewAsRole: UserRole | null = (() => {
    const p = searchParams?.get('viewAs');
    return p && ['admin', 'teacher', 'student'].includes(p) ? (p as UserRole) : null;
  })();

  useEffect(() => {
    const update = () => setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      const path = pathname || '';
      if (!path.startsWith('/offline')) {
        try {
          sessionStorage.setItem('lastOnlinePath', path);
        } catch { }
        router.push('/offline');
      }
    }
  }, [isOnline, pathname, router]);

  const navConfig = getNavigationForRole(userRole, viewAsRole);

  const effectiveRole = viewAsRole || userRole || 'user';

  // Determine if we should show View As switcher
  const showViewAs = isSuperAdmin && !viewAsRole; // Only show when not already viewing as another role

  // Show banner when viewing as another role
  const isViewingAs = viewAsRole && viewAsRole !== userRole;

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);
  }, []);

  return (
    <header className="sticky top-0 z-[1000] bg-elite-bg/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl transition-all duration-300">
      {!isOnline && (
        <div className="bg-red-500 text-white text-xs font-medium py-1.5 px-4 text-center">
          ⚠️ You appear to be offline.
          <button
            onClick={() => router.push('/offline')}
            className="ml-2 underline hover:text-white/90"
            title="View offline help"
          >
            View Help
          </button>
          <button
            onClick={() => typeof window !== 'undefined' && window.location.reload()}
            className="ml-2 underline hover:text-white/90"
            title="Retry connection"
          >
            Retry
          </button>
        </div>
      )}
      {isViewingAs && (
        <div className="bg-elite-accent-cyan text-black text-[10px] font-black uppercase tracking-[0.2em] py-1.5 px-4 text-center">
          Monitoring Protocol: Active Viewing as {viewAsRole} •
          <Link href="/admin/super" className="underline ml-2 hover:text-white transition-colors">
            Terminate Session
          </Link>
        </div>
      )}
      <div className="container mx-auto px-4 py-3 flex flex-col gap-3 overflow-visible">
        <div className="flex items-center justify-between gap-2 overflow-visible">
          <div className="flex items-center gap-3">
            <SiteBrand />
            <nav className="hidden lg:flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.15em]">
              {navConfig.primaryLinks.map((item, idx) => {
                // Check if this is a dropdown menu
                if ('items' in item) {
                  const dropdown = item as import('@/lib/navigation-config').NavDropdown;
                  return (
                    <div key={idx} className="relative group">
                      <button
                        className="px-4 py-2 rounded-xl transition-all hover:bg-white/5 text-slate-400 hover:text-white flex items-center gap-2"
                        aria-haspopup="true"
                        aria-expanded="false"
                      >
                        {dropdown.icon && <span className="text-sm">{dropdown.icon}</span>}
                        <span>{dropdown.label}</span>
                        <span className="text-[8px] opacity-30 transition-transform group-hover:rotate-180">▼</span>
                      </button>
                      {/* Dropdown Menu */}
                      <div className="absolute left-0 top-full mt-2 w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[1001] translate-y-2 group-hover:translate-y-0">
                        <div className="glass-card-premium rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                          {dropdown.items.map((subItem) => {
                            const isActive = pathname?.startsWith(subItem.href.split("?")[0]);
                            return (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`block px-5 py-3 hover:bg-white/5 transition-all flex items-center gap-3 ${isActive ? 'bg-elite-accent-cyan/10 font-black text-elite-accent-cyan' : 'text-slate-400 hover:text-white'
                                  }`}
                              >
                                {subItem.icon && <span className="text-base grayscale group-hover:grayscale-0">{subItem.icon}</span>}
                                <span>{subItem.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }
                // Regular link
                const link = item as import('@/lib/navigation-config').NavLink;
                const isActive = pathname?.startsWith(link.href.split("?")[0]);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${isActive ? "bg-white/5 text-white border border-white/10" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                      }`}
                    title={link.label}
                  >
                    {link.icon && <span className="text-sm">{link.icon}</span>}
                    <span>{link.label}</span>
                    {link.badge && (
                      <span className="ml-1 text-[8px] bg-elite-accent-cyan/20 text-elite-accent-cyan px-2 py-0.5 rounded-full font-black">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Navigation Items and Search */}
          <div className="flex items-center gap-1.5 overflow-visible">
            {/* Desktop Search */}
            <div className="hidden md:block">
              <GlobalSearch />
            </div>

            <button
              aria-label="Open menu"
              className="lg:hidden inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 p-2"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="text-lg text-white">☰</span>
            </button>

            {showViewAs && (
              <div className="flex items-center gap-1.5">
                <ViewAsSwitcher
                  currentRole={userRole || 'student'}
                  isSuperAdmin={isSuperAdmin}
                />

                {navConfig.showAdminBadge && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[8px] font-black uppercase tracking-widest border transition-all ${effectiveRole === 'superadmin' ? 'bg-elite-accent-purple/20 text-elite-accent-purple border-elite-accent-purple/30 glow-purple' :
                    effectiveRole === 'admin' ? 'bg-elite-accent-cyan/20 text-elite-accent-cyan border-elite-accent-cyan/30 glow-cyan' :
                      effectiveRole === 'teacher' ? 'bg-elite-accent-emerald/20 text-elite-accent-emerald border-elite-accent-emerald/30 glow-emerald' :
                        'bg-white/5 text-white/50 border-white/10'
                    }`}>
                    <span className="relative flex h-1.5 w-1.5 mr-1">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${effectiveRole === 'superadmin' ? 'bg-elite-accent-purple' : effectiveRole === 'admin' ? 'bg-elite-accent-cyan' : 'bg-elite-accent-emerald'}`}></span>
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${effectiveRole === 'superadmin' ? 'bg-elite-accent-purple' : effectiveRole === 'admin' ? 'bg-elite-accent-cyan' : 'bg-elite-accent-emerald'}`}></span>
                    </span>
                    {effectiveRole} node
                  </span>
                )}
              </div>
            )}

            {/* Refectl Hub - Unified Dropdown */}
            <div className="relative hidden lg:block z-[1002]">
              <button
                onClick={() => setActionsOpen((v) => !v)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all duration-300 text-white border border-white/5 hover:border-elite-accent-cyan/30 hover:shadow-2xl hover:shadow-elite-accent-cyan/10 active:scale-95 group"
                aria-label="Refectl Hub"
                title="Refectl Hub"
              >
                <span className="text-lg group-hover:scale-125 transition-transform duration-500">⚡</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Relay Hub</span>
                <span className={`text-[8px] opacity-30 transition-transform duration-300 ${actionsOpen ? 'rotate-180' : ''}`}>▼</span>
              </button>

              {actionsOpen && (
                <div
                  className="fixed mt-6 w-96 rounded-[2.5rem] bg-elite-bg/95 text-white shadow-[0_30px_100px_-15px_rgba(0,0,0,0.8)] border border-white/10 z-[9999] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-300 backdrop-blur-3xl ring-1 ring-white/5"
                  style={{
                    right: 'max(1rem, calc((100vw - 1280px) / 2 + 1rem))',
                    top: '4.5rem'
                  }}
                >
                  {!userRole ? (
                    <div className="px-4 py-8 text-center">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <p className="text-xs text-slate-500 font-medium">Loading your Hub...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      {/* 🚀 Creation Studio Section */}
                      <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="flex items-center justify-between px-2 mb-4">
                          <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.4em]">Creation Studio</span>
                        </div>
                        <div className="grid gap-2">
                          {(effectiveRole === 'teacher' || effectiveRole === 'admin' || effectiveRole === 'superadmin') && (
                            <Link href="/admin/studio/courses" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                              <div className="w-10 h-10 rounded-xl bg-elite-accent-cyan/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📚</div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-white">Course Architect</span>
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Design new curricula</span>
                              </div>
                            </Link>
                          )}
                          {(effectiveRole === 'content_writer' || effectiveRole === 'admin' || effectiveRole === 'superadmin') && (
                            <Link href="/admin/studio/news" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🎙️</div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Elite Bulletin</span>
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Global newsroom desk</span>
                              </div>
                            </Link>
                          )}
                          <Link href="/admin/studio/blogs" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                            <div className="w-10 h-10 rounded-xl bg-elite-accent-purple/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📝</div>
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black uppercase tracking-widest text-elite-accent-purple">Blog Studio</span>
                              <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Share your thoughts</span>
                            </div>
                          </Link>
                          {(effectiveRole === 'teacher' || effectiveRole === 'admin' || effectiveRole === 'superadmin' || effectiveRole === 'content_writer') && (
                            <Link href="/admin/studio/ebooks" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                              <div className="w-10 h-10 rounded-xl bg-elite-accent-emerald/10 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📘</div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-elite-accent-emerald">Ebook Studio</span>
                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tighter">Create rich resources</span>
                              </div>
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* ⚙️ Preferences Section */}
                      <div className="p-6 border-b border-white/5">
                        <div className="px-2 mb-4 text-[10px] uppercase font-black text-slate-500 tracking-[0.4em]">Preferences</div>
                        <div className="flex items-center justify-between gap-4 px-2">
                          <div className="flex-1">
                            <LanguageSwitcher />
                          </div>
                          <div className="flex-shrink-0">
                            <ThemeToggle />
                          </div>
                        </div>
                      </div>

                      {/* 🔔 Notifications Section */}
                      <div className="p-6 border-b border-white/5 bg-white/5">
                        <div className="px-2 mb-4 flex items-center justify-between">
                          <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.4em]">Intelligence Alerts</span>
                          <NotificationBell />
                        </div>
                      </div>

                      {/* 👤 My Account Section */}
                      <div className="p-6 bg-elite-accent-cyan/5">
                        <div className="px-2 mb-4 text-[10px] uppercase font-black text-slate-500 tracking-[0.4em]">My Account</div>
                        <div className="grid gap-2">
                          {effectiveRole === 'superadmin' && (
                            <Link href="/admin/super" className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-elite-accent-purple text-black hover:bg-white transition-all text-xs font-black uppercase tracking-widest shadow-xl shadow-elite-accent-purple/20 mb-2" onClick={() => setActionsOpen(false)}>
                              🛡️ Command Console
                            </Link>
                          )}
                          <Link href="/dashboard" className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group" onClick={() => setActionsOpen(false)}>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg group-hover:rotate-12 transition-transform">📊</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Universal Dashboard</span>
                          </Link>
                        </div>
                        <div className="mt-6 flex items-center justify-between px-5 py-4 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
                          <div className="flex items-center gap-4">
                            <UserButton afterSignOutUrl="/" />
                            <div className="flex flex-col">
                              <span className="text-[10px] font-black text-white uppercase tracking-tight">Active Node</span>
                              <span className="text-[8px] text-elite-accent-cyan font-black uppercase tracking-[0.2em]">{effectiveRole}</span>
                            </div>
                          </div>
                          {!isPro && !isSuperAdmin && (
                            <Link href="/pricing" onClick={() => setActionsOpen(false)}>
                              <button className="text-[10px] font-black text-black bg-elite-accent-cyan px-3 py-1.5 rounded-xl hover:scale-105 transition-transform uppercase tracking-widest shadow-lg shadow-elite-accent-cyan/20">
                                Evolve
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden xl:flex items-center gap-2">
              {/* Individual items removed as they are now in the Hub */}
            </div>
            {mounted && (
              <SignedIn>
                {!isPro && !isSuperAdmin && userRole !== 'admin' && userRole !== 'teacher' && (
                  <Link href="/pricing" className="mr-2">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold border-0 shadow-lg animate-pulse whitespace-nowrap hidden sm:flex items-center gap-1.5"
                    >
                      <span className="text-sm">👑 Upgrade to Pro</span>
                    </Button>
                  </Link>
                )}
                {/* Individual notification bell removed as it's in the Hub */}
              </SignedIn>
            )}
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-200 dark:border-white text-slate-600 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10"
                >
                  {t('login')}
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button variant="inverse" size="sm">
                  {t('signup')}
                </Button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-[2000] bg-elite-bg/60 backdrop-blur-md">
            <div className="absolute top-0 right-0 w-80 max-w-[85vw] h-full bg-elite-bg text-white shadow-2xl p-6 flex flex-col gap-6 border-l border-white/5 animate-in slide-in-from-right duration-500">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">System Menu</span>
                <button className="text-white bg-white/5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10" onClick={() => setMobileOpen(false)}>✕</button>
              </div>
              <div className="flex flex-col gap-2">
                {navConfig.primaryLinks.map((item, idx) => {
                  // Check if this is a dropdown menu
                  if ('items' in item) {
                    const dropdown = item as import('@/lib/navigation-config').NavDropdown;
                    return (
                      <div key={idx}>
                        <div className="px-3 py-2 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wide flex items-center gap-2">
                          {dropdown.icon && <span>{dropdown.icon}</span>}
                          {dropdown.label}
                        </div>
                        {dropdown.items.map((subItem) => {
                          const isActive = pathname?.startsWith(subItem.href.split("?")[0]);
                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`pl-6 pr-3 py-2 rounded-lg flex items-center gap-2 ${isActive ? 'bg-slate-100 dark:bg-slate-800 font-semibold' : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                              onClick={() => setMobileOpen(false)}
                            >
                              {subItem.icon && <span className="text-base">{subItem.icon}</span>}
                              <span className="text-sm">{subItem.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }

                  // Regular link
                  const link = item as import('@/lib/navigation-config').NavLink;
                  const isActive = pathname?.startsWith(link.href.split("?")[0]);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${isActive ? 'bg-white/5 font-black text-white border border-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                        }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.icon && <span className="text-lg grayscale group-hover:grayscale-0">{link.icon}</span>}
                      <span className="text-[10px] font-black uppercase tracking-widest">{link.label}</span>
                    </Link>
                  );
                })}
              </div>
              {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'teacher' || effectiveRole === 'student' || effectiveRole === 'content_writer') && (
                <div className="mt-2 border-t pt-2">
                  <div className="text-xs font-semibold text-slate-500 mb-2">Actions</div>
                  <div className="flex flex-col gap-2">
                    {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'teacher') && (
                      <Link href="/admin/studio/courses" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>📚 Create Course</Link>
                    )}
                    {(effectiveRole === 'superadmin' || effectiveRole === 'admin' || effectiveRole === 'content_writer') && (
                      <Link href="/admin/studio/news" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>🎙️ <span className="text-red-700">Terai Times</span> Studio</Link>
                    )}
                    <Link href="/admin/studio/blogs" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>📝 Write Blog</Link>
                    {effectiveRole === 'student' && (
                      <Link href="/admin/studio/practice" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>🎯 Self Practice</Link>
                    )}
                    {(effectiveRole === 'superadmin' || effectiveRole === 'admin') && (
                      <Link href="/admin/users" className="px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => setMobileOpen(false)}>👥 Manage Users</Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile/Tablet Search (Row 2) */}
        <div className="xl:hidden glass-card-premium rounded-2xl border-white/10 shadow-2xl overflow-hidden mt-4">
          <GlobalSearch />
        </div>
      </div>
    </header >
  );
}
