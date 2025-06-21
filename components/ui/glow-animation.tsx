'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

interface GlowAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  glowOpacity?: number;
}

export function GlowAnimation({
  className,
  variant = 'default',
  size = 'md',
  glowOpacity = 0.7,
  ...props
}: GlowAnimationProps) {
  const variantColors = {
    default: {
      from: 'from-indigo-500',
      via: 'via-purple-500',
      to: 'to-pink-500',
    },
    primary: {
      from: 'from-blue-400',
      via: 'via-cyan-400',
      to: 'to-teal-400',
    },
    secondary: {
      from: 'from-fuchsia-500',
      via: 'via-pink-500',
      to: 'to-orange-400',
    },
  };

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const { from, via, to } = variantColors[variant];

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center', 
        className
      )}
      {...props}
    >
      <div className={cn(
        'absolute rounded-full animate-pulse blur-xl opacity-70',
        sizeClasses[size],
        `bg-gradient-to-r ${from} ${via} ${to}`
      )} 
      style={{ opacity: glowOpacity }}
      />
      <div className={cn(
        'absolute animate-spin-slow rounded-full',
        sizeClasses[size],
        `bg-gradient-to-r ${from} ${via} ${to} opacity-30`
      )} />
      <div className="relative z-10">
        <Sparkles className={cn(
          'text-white animate-pulse',
          size === 'sm' && 'h-3 w-3',
          size === 'md' && 'h-5 w-5',
          size === 'lg' && 'h-7 w-7',
        )} />
      </div>
    </div>
  );
}
