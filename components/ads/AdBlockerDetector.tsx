'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Extend Window interface for AdSense
declare global {
    interface Window {
        adsbygoogle?: any[];
    }
}

export function AdBlockerDetector({ children }: { children: React.ReactNode }) {
    const [adBlockDetected, setAdBlockDetected] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const detectAdBlocker = async () => {
            try {
                // Method 1: Try to fetch a known ad-related URL
                const adTest = document.createElement('div');
                adTest.innerHTML = '&nbsp;';
                adTest.className = 'adsbox ad-placement ad-placeholder adbanner';
                adTest.style.cssText = 'position:absolute;top:-1px;left:-1px;width:1px;height:1px;';
                document.body.appendChild(adTest);

                // Wait a bit for ad blockers to act
                await new Promise(resolve => setTimeout(resolve, 100));

                const isBlocked =
                    adTest.offsetHeight === 0 ||
                    adTest.offsetWidth === 0 ||
                    window.getComputedStyle(adTest).display === 'none' ||
                    window.getComputedStyle(adTest).visibility === 'hidden';

                document.body.removeChild(adTest);

                // Method 2: Check if AdSense script loaded
                const adsenseBlocked = typeof window.adsbygoogle === 'undefined';

                setAdBlockDetected(isBlocked || adsenseBlocked);
            } catch (error) {
                console.error('Ad blocker detection error:', error);
                setAdBlockDetected(false);
            } finally {
                setIsChecking(false);
            }
        };

        // Run detection after a short delay to allow scripts to load
        const timer = setTimeout(detectAdBlocker, 1500);
        return () => clearTimeout(timer);
    }, []);

    // Show loading state while checking
    if (isChecking) {
        return <>{children}</>;
    }

    // If ad blocker detected and not dismissed, show overlay
    if (adBlockDetected && !dismissed) {
        return (
            <>
                {/* Blurred content in background */}
                <div className="relative">
                    <div className="blur-sm pointer-events-none select-none">{children}</div>

                    {/* Ad blocker warning overlay */}
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12 space-y-6 relative">
                            {/* Close button (allows dismissal) */}
                            <button
                                onClick={() => setDismissed(true)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 transition-colors"
                                aria-label="Dismiss"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                                    <Shield size={40} className="text-white" />
                                </div>
                            </div>

                            {/* Heading */}
                            <div className="text-center space-y-3">
                                <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
                                    Ad Blocker Detected
                                </h2>
                                <p className="text-lg text-slate-600">
                                    We noticed you're using an ad blocker. Our content is free because of ads.
                                </p>
                            </div>

                            {/* Message */}
                            <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle size={24} className="text-orange-500 flex-shrink-0 mt-1" />
                                    <div className="space-y-2">
                                        <p className="text-slate-700 font-medium">
                                            To continue reading our news and blog content, please:
                                        </p>
                                        <ul className="list-disc list-inside text-slate-600 space-y-1 ml-2">
                                            <li>Disable your ad blocker for this site</li>
                                            <li>Add us to your ad blocker's whitelist</li>
                                            <li>Or consider supporting us with a subscription</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Why we need ads */}
                            <div className="text-center text-sm text-slate-500 space-y-2">
                                <p>
                                    <strong>Why do we show ads?</strong>
                                </p>
                                <p>
                                    Ads help us keep our journalism free and accessible to everyone. They support our
                                    writers, editors, and the technology that powers this platform.
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    onClick={() => window.location.reload()}
                                    variant="inverse"
                                    className="bg-gradient-to-r from-red-600 to-orange-500 text-white hover:from-red-700 hover:to-orange-600"
                                >
                                    I've Disabled My Ad Blocker
                                </Button>
                                <Button
                                    onClick={() => setDismissed(true)}
                                    variant="ghost"
                                    className="border border-slate-200 hover:bg-slate-50"
                                >
                                    Continue Anyway
                                </Button>
                            </div>

                            {/* Fine print */}
                            <p className="text-xs text-center text-slate-400">
                                By continuing, you support independent journalism and quality content.
                            </p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // No ad blocker or dismissed - show normal content
    return <>{children}</>;
}
