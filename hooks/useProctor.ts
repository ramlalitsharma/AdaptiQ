'use client';

import { useState, useEffect, useRef } from 'react';

export type ProctorEvent = 'tab_switch' | 'focus_loss' | 'focus_gain' | 'snapshot';

interface ProctorLog {
    event: ProctorEvent;
    timestamp: Date;
    metadata?: any;
}

export function useProctor(sessionId: string, active: boolean = true) {
    const [events, setEvents] = useState<ProctorLog[]>([]);
    const lastEventRef = useRef<number>(0);

    const logEvent = async (event: ProctorEvent, metadata?: any) => {
        if (!active) return;

        // Throttling logs to avoid spam (1s)
        const now = Date.now();
        if (now - lastEventRef.current < 1000) return;
        lastEventRef.current = now;

        const newLog: ProctorLog = {
            event,
            timestamp: new Date(),
            metadata,
        };

        setEvents((prev) => [...prev, newLog]);

        // Send to API
        try {
            await fetch('/api/proctor/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    event,
                    metadata,
                    timestamp: newLog.timestamp,
                }),
            });
        } catch (error) {
            console.error('Failed to log proctoring event:', error);
        }
    };

    useEffect(() => {
        if (!active) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                logEvent('tab_switch', { details: 'Browser tab hidden or minimized' });
            }
        };

        const handleBlur = () => {
            logEvent('focus_loss', { details: 'Window focus lost' });
        };

        const handleFocus = () => {
            logEvent('focus_gain', { details: 'Window focus regained' });
        };

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, [active, sessionId]);

    return {
        events,
        logEvent,
    };
}
