"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";

/**
 * Global Back Button for Navbar
 * Synchronized with the platform's theme and UX flow.
 */
export function NavbarBackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show on home page as there's nothing to go back to in the app's context
    if (pathname === "/") {
        return null;
    }

    return (
        <button
            onClick={() => router.back()}
            className="group flex items-center justify-center p-2 mr-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 text-white focus:outline-none focus:ring-2 focus:ring-white/30"
            title="Go Back"
            aria-label="Previous page"
        >
            <svg
                className="w-5 h-5 group-active:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    );
}
