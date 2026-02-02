'use client';

import { motion } from 'framer-motion';

interface CircularProgressProps {
    value: number; // 0-100
    size?: number; // diameter in pixels
    strokeWidth?: number;
    color?: 'blue' | 'green' | 'purple' | 'orange' | 'teal';
    label?: string;
    showPercentage?: boolean;
    className?: string;
}

const colorMap = {
    blue: {
        stroke: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.1)',
        text: '#ffffff',
    },
    green: {
        stroke: '#10b981',
        bg: 'rgba(16, 185, 129, 0.1)',
        text: '#10b981',
    },
    purple: {
        stroke: '#a855f7',
        bg: 'rgba(168, 85, 247, 0.1)',
        text: '#a855f7',
    },
    orange: {
        stroke: '#f97316',
        bg: 'rgba(249, 115, 22, 0.1)',
        text: '#f97316',
    },
    teal: {
        stroke: '#06b6d4',
        bg: 'rgba(6, 182, 212, 0.1)',
        text: '#06b6d4',
    },
};

export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 4,
    color = 'teal',
    label,
    showPercentage = true,
    className = '',
}: CircularProgressProps) {
    const normalizedValue = Math.min(100, Math.max(0, value));
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (normalizedValue / 100) * circumference;

    const colors = colorMap[color];

    return (
        <div className={`inline-flex flex-col items-center gap-4 ${className}`}>
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90 select-none"
                >
                    <defs>
                        <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={colors.stroke} />
                            <stop offset="100%" stopColor={colors.stroke} stopOpacity={0.6} />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={colors.bg}
                        strokeWidth={strokeWidth}
                        fill="none"
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={`url(#grad-${color})`}
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        filter="url(#glow)"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'circOut' }}
                    />
                </svg>

                {showPercentage && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-2xl font-black text-white tracking-tighter">
                                {Math.round(normalizedValue)}%
                            </div>
                            {label && (
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-0.5">
                                    {label.split(' ').slice(0, 1)}
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>

            {label && (
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</span>
            )}
        </div>
    );
}
