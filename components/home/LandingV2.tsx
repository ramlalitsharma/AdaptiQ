"use client";

import React from 'react';
import { FadeIn, ScaleIn } from '@/components/ui/Motion';
import {
    TrendingUp, Zap, Shield, Globe, Cpu, Layers, PieChart, Workflow, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function FeatureCard({ icon, title, description, accent }: {
    icon: React.ReactNode,
    title: string,
    description: string,
    accent: string
}) {
    const accentClasses: Record<string, string> = {
        cyan: "group-hover:border-elite-accent-cyan/50 group-hover:shadow-elite-accent-cyan/20",
        purple: "group-hover:border-elite-accent-purple/50 group-hover:shadow-elite-accent-purple/20",
        emerald: "group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/20",
        blue: "group-hover:border-blue-500/50 group-hover:shadow-blue-500/20",
        orange: "group-hover:border-orange-500/50 group-hover:shadow-orange-500/20",
        yellow: "group-hover:border-yellow-500/50 group-hover:shadow-yellow-500/20",
    };

    return (
        <div className={`glass-card-premium p-8 rounded-[2rem] border-white/5 group transition-all duration-500 ${accentClasses[accent] || ""}`}>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {icon}
            </div>
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">{description}</p>
        </div>
    );
}

export function StepItem({ number, title, description }: {
    number: string,
    title: string,
    description: string
}) {
    return (
        <div className="space-y-6 relative group">
            <div className="text-6xl font-black text-white/5 group-hover:text-elite-accent-cyan/10 transition-colors duration-500 absolute -top-10 -left-4">
                {number}
            </div>
            <div className="relative pt-6">
                <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-elite-accent-cyan shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                    {title}
                </h3>
                <p className="text-slate-400 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </div>
    );
}

export function EngineeredForExcellence() {
    return (
        <section className="relative z-20 py-32 bg-elite-bg px-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-elite-accent-purple/5 rounded-full blur-[150px]" />

            <div className="container mx-auto">
                <div className="max-w-3xl mb-24 space-y-6">
                    <FadeIn>
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-cyan">Infrastructure</h2>
                    </FadeIn>
                    <FadeIn delay={0.1}>
                        <h3 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight">
                            Engineered for <br />
                            <span className="text-white/40 text-gradient-purple">Excellence.</span>
                        </h3>
                    </FadeIn>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Cpu className="text-elite-accent-cyan" />}
                        title="AI-Orchestrated Curriculum"
                        description="Our neural engine adapts to your learning pace, identifying knowledge gaps before they stop you."
                        accent="cyan"
                    />
                    <FeatureCard
                        icon={<Shield className="text-elite-accent-purple" />}
                        title="Enterprise Grade Security"
                        description="Privacy-first data architecture ensures your intellectual progress is secured with elite encryption."
                        accent="purple"
                    />
                    <FeatureCard
                        icon={<Globe className="text-emerald-400" />}
                        title="Global Talent Network"
                        description="Connect with high-performance peers and industry leaders in our exclusive Refectl ecosystem."
                        accent="emerald"
                    />
                    <FeatureCard
                        icon={<Layers className="text-blue-400" />}
                        title="Multi-DB Sync Technology"
                        description="Blazing fast performance powered by three separate database engines working in high-frequency."
                        accent="blue"
                    />
                    <FeatureCard
                        icon={<PieChart className="text-orange-400" />}
                        title="Predictive Career Pathing"
                        description="We don't just teach. We predict your future role based on trending market pulse data."
                        accent="orange"
                    />
                    <FeatureCard
                        icon={<Zap className="text-yellow-400" />}
                        title="High-Frequency Updates"
                        description="Courses are updated daily using AI to reflect the latest shifts in the global economy."
                        accent="yellow"
                    />
                </div>
            </div>
        </section>
    );
}

export function PathToExcellence() {
    return (
        <section className="py-32 bg-white/5 border-y border-white/5">
            <div className="container mx-auto px-4">
                <div className="text-center mb-24 space-y-6">
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
                        Your Path to <span className="text-gradient-cyan">Excellence.</span>
                    </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-16">
                    <StepItem number="01" title="Assessment" description="Complete our high-fidelity benchmarking to map your current skill DNA." />
                    <StepItem number="02" title="Assimilation" description="Engage with AI-optimized content designed specifically for your neural profile." />
                    <StepItem number="03" title="Achievement" description="Earn industry-recognized credentials verified on the transparent ledger." />
                </div>
            </div>
        </section>
    );
}
