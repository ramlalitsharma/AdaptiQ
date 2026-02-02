"use client";

import { format } from "date-fns";
import { Link } from "@/lib/navigation";
import { Search, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function NewsNavbar() {
    const [dateString, setDateString] = useState("");
    
    useEffect(() => {
        setTimeout(() => setDateString(format(new Date(), "EEEE, MMMM dd, yyyy")), 0);
    }, []);

    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category') || 'All';
    const currentCountry = searchParams.get('country') || 'All';

    return (
        <header className="bg-[#fdfdfc] border-b border-slate-200 sticky top-0 z-[100] news-paper-theme">
            {/* Top Utility Strip */}
            <div className="border-b border-slate-100 py-2 bg-slate-50/50">
                <div className="container mx-auto px-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <div className="flex items-center gap-4">
                        <span className="min-w-[150px]">{dateString}</span>
                        <span className="hidden md:inline-flex items-center gap-1">
                            <Globe size={10} /> Terai Pulse: High
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="hover:text-red-700 transition-colors">Digital Edition</button>
                        <button className="hover:text-red-700 transition-colors border-l pl-4 border-slate-200">Intelligence Terminal</button>
                    </div>
                </div>
            </div>

            {/* Main Brand & Nav Container */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">
                    {/* Search Icon (Desktop Left) */}
                    <button className="hidden md:block p-2 text-slate-400 hover:text-red-700 transition-colors">
                        <Search size={20} />
                    </button>

                    {/* Centered Brand Logo */}
                    <Link href="/news" className="flex flex-col items-center group">
                        <div className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none text-red-700 font-serif">
                            Terai Times
                        </div>
                        <div className="text-[10px] md:text-[11px] uppercase font-black tracking-[0.3em] text-slate-400 mt-2 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-slate-200"></span>
                            Refectl Intelligence Agency
                            <span className="w-12 h-[1px] bg-slate-200"></span>
                        </div>
                    </Link>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <Link href="/news/subscribe" className="bg-red-700 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-red-500/10">
                            Subscribe
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-red-700 transition-colors md:hidden">
                            <Search size={20} />
                        </button>
                    </div>
                </div>

                <nav className="mt-8 flex items-center justify-center border-t border-slate-100 pt-3">
                    <ul className="flex items-center gap-1 md:gap-6 overflow-x-auto md:overflow-visible no-scrollbar pb-2 md:pb-0 text-[11px] md:text-xs font-black uppercase tracking-wider text-slate-500">
                        {['Home', 'World', 'Politics', 'Business'].map(item => {
                            const href = item === 'Home'
                                ? `/news${currentCountry !== 'All' ? `?country=${currentCountry}` : ''}`
                                : `/news?category=${item}${currentCountry !== 'All' ? `&country=${currentCountry}` : ''}`;

                            return (
                                <li key={item}>
                                    <Link
                                        href={href}
                                        className={`hover:text-red-700 transition-colors whitespace-nowrap px-2 ${currentCategory === item ? 'text-red-700 font-black' : ''}`}
                                    >
                                        {item}
                                    </Link>
                                </li>
                            );
                        })}

                        {/* More Categories Dropdown */}
                        <li className="ml-2 border-l pl-4 border-slate-200 relative group/more">
                            <button className={`flex items-center gap-1 hover:text-red-700 transition-colors uppercase py-1 ${['Opinion', 'Tech', 'Culture', 'Science', 'Sports', 'Health', 'Style'].includes(currentCategory) ? 'text-red-700 font-black' : ''}`}>
                                More <ChevronDown size={12} />
                            </button>
                            <div className="absolute top-full left-0 mt-0 w-48 bg-white border border-slate-100 shadow-2xl rounded-xl py-4 opacity-0 invisible group-hover/more:opacity-100 group-hover/more:visible transition-all z-[110]">
                                {['Opinion', 'Tech', 'Culture', 'Science', 'Sports', 'Health', 'Style'].map(item => (
                                    <Link
                                        key={item}
                                        href={`/news?category=${item}${currentCountry !== 'All' ? `&country=${currentCountry}` : ''}`}
                                        className={`block px-6 py-2 hover:bg-slate-50 hover:text-red-700 transition-colors font-bold text-[10px] uppercase tracking-widest ${currentCategory === item ? 'text-red-700' : ''}`}
                                    >
                                        {item}
                                    </Link>
                                ))}
                            </div>
                        </li>

                        {/* Country Filter Dropdown (Last) */}
                        <li className="ml-2 border-l pl-4 border-slate-200 relative group/country">
                            <button className={`flex items-center gap-1 hover:text-red-700 transition-colors uppercase py-1 ${currentCountry !== 'All' ? 'text-red-700 font-black' : ''}`}>
                                {currentCountry === 'All' ? 'Country' : currentCountry} <ChevronDown size={12} />
                            </button>
                            {/* Country Dropdown */}
                            <div className="absolute top-full right-0 mt-0 w-48 bg-white border border-slate-100 shadow-2xl rounded-xl py-4 opacity-0 invisible group-hover/country:opacity-100 group-hover/country:visible transition-all z-[110]">
                                {['All', 'Nepal', 'USA', 'India', 'UK', 'Australia', 'Japan', 'China'].map(country => (
                                    <Link
                                        key={country}
                                        href={`/news?country=${country}${currentCategory !== 'All' ? `&category=${currentCategory}` : ''}`}
                                        className="block px-6 py-2 hover:bg-slate-50 hover:text-red-700 transition-colors font-bold text-[10px] uppercase tracking-widest"
                                    >
                                        {country}
                                    </Link>
                                ))}
                            </div>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
