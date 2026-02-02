import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 hover:to-teal-600',
        outline: 'border-2 border-slate-200 text-slate-700 hover:border-teal-600 hover:text-teal-600 hover:bg-teal-50',
        ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        inverse: 'bg-white text-teal-600 hover:bg-slate-50 border border-slate-100 shadow-sm',
        destructive: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/40',
        secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
      },
      size: {
        default: 'px-5 py-2.5',
        sm: 'px-4 py-2 text-xs',
        xs: 'px-3 py-1.5 text-[10px] uppercase tracking-wider',
        lg: 'px-8 py-4 text-base',
        icon: 'p-2 rounded-xl h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',

    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const composedClass = cn(buttonVariants({ variant, size }), className);
  const computedDisabled = !!disabled || isLoading;

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn(composedClass, (children.props as { className?: string }).className),
      disabled: computedDisabled,
      'data-loading': isLoading || undefined,
      ...(props as any),
    });
  }

  return (
    <button className={composedClass} disabled={computedDisabled} {...props}>
      {isLoading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
