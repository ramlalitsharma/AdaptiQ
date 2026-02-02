"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Global Premium Back Button
 * Positoned in the "Absolute Top-Left" for a high-end SaaS feel.
 * Uses advanced glassmorphism for a world-class aesthetic.
 */
export function GlobalBackButton() {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    // Synchronize visibility with route
    useEffect(() => {
        // Hide on landing page
        if (pathname === "/" || pathname === "/sign-in" || pathname === "/sign-up") {
            setTimeout(() => setIsVisible(false), 0);
        } else {
            setTimeout(() => setIsVisible(true), 0);
        }
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <div className="fixed top-2 left-4 z-[9999] pointer-events-none sm:top-2.5 sm:left-6 lg:top-3 lg:left-8">
            <button
                onClick={() => router.back()}
                className="
          pointer-events-auto
          group
          relative
          flex items-center justify-center
          w-10 h-10 lg:w-11 lg:h-11
          bg-white/10 dark:bg-slate-900/20
          backdrop-blur-xl
          border border-white/20 dark:border-white/10
          rounded-xl
          shadow-lg
          transition-all duration-300
          hover:scale-105 active:scale-95
          hover:bg-white/20 dark:hover:bg-slate-900/30
          focus:outline-none focus:ring-2 focus:ring-white/30
        "
                title="Go Back"
            >
                {/* Cinematic Highlight Effect */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* High-End SVG Arrow */}
                <svg
                    className="w-5 h-5 text-white transition-transform duration-300 group-hover:-translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>

                {/* Minimalist Tooltip */}
                <span className="absolute left-full ml-3 px-2 py-1 bg-black/90 backdrop-blur-md text-white text-[9px] font-bold uppercase tracking-widest rounded opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 pointer-events-none whitespace-nowrap hidden lg:block">
                    Back
                </span>
            </button>
        </div>
    );
}
