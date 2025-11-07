import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500',
        outline: 'border border-slate-300 text-slate-700 hover:bg-slate-100 focus:ring-teal-500',
        ghost: 'text-slate-600 hover:bg-slate-100',
        inverse: 'bg-white text-teal-600 hover:bg-slate-50 focus:ring-teal-400',
      },
      size: {
        default: 'px-4 py-2',
        sm: 'px-3 py-1.5 text-sm',
        lg: 'px-6 py-3 text-base',
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
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const composedClass = cn(buttonVariants({ variant, size }), className);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      className: cn((children.props as { className?: string }).className, composedClass),
      ...props,
    });
  }

  return (
    <button className={composedClass} {...props}>
      {children}
    </button>
  );
}
