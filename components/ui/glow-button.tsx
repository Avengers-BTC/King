import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ButtonProps } from '@/components/ui/button';

export interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  href?: string;
  className?: string;
}

export function GlowButton({
  className,
  variant = 'default',
  size = 'default',
  href,
  children,
  ...props
}: GlowButtonProps) {
  const baseStyles = cn(
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    {
      'bg-electric-pink text-white shadow-glow-pink hover:bg-electric-pink/90': variant === 'default',
      'bg-app-surface text-app-text shadow-glow-cyan hover:bg-app-surface/90': variant === 'secondary',
      'h-9 px-4 py-2': size === 'default',
      'h-8 px-3 text-sm': size === 'sm',
      'h-12 px-8 text-lg': size === 'lg',
    },
    className
  );

  if (href) {
    return (
      <Link href={href} className={baseStyles}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseStyles} {...props}>
      {children}
    </button>
  );
}
