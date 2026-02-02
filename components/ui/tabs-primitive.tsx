'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// UI: Tabs Primitive (Context-based)
const TabsContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
} | null>(null);

function Tabs({
    defaultValue,
    value,
    onValueChange,
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}) {
    const [active, setActive] = React.useState(value || defaultValue || '');

    // Sync with prop if controlled
    React.useEffect(() => {
        if (value !== undefined) {
            setActive(value);
        }
    }, [value]);

    const handleValueChange = React.useCallback(
        (newValue: string) => {
            if (value === undefined) {
                setActive(newValue);
            }
            onValueChange?.(newValue);
        },
        [value, onValueChange]
    );

    return (
        <TabsContext.Provider value={{ value: active, onValueChange: handleValueChange }}>
            <div className={cn('w-full', className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    );
}

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            'inline-flex h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500',
            className
        )}
        {...props}
    />
));
TabsList.displayName = 'TabsList';

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsTrigger must be used within Tabs');

    const isActive = context.value === value;

    return (
        <button
            ref={ref}
            className={cn(
                'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
                isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'hover:bg-slate-200/50 hover:text-slate-900',
                className
            )}
            onClick={() => context.onValueChange(value)}
            {...props}
        />
    );
});
TabsTrigger.displayName = 'TabsTrigger';

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) throw new Error('TabsContent must be used within Tabs');

    if (context.value !== value) return null;

    return (
        <div
            ref={ref}
            className={cn(
                'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2',
                className
            )}
            {...props}
        />
    );
});
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
