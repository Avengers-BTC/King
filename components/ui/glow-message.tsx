'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface GlowMessageProps {
  children: React.ReactNode;
  className?: string;
  isSender?: boolean;
  animate?: boolean;
}

export function GlowMessage({ 
  children, 
  className, 
  isSender = false,
  animate = true
}: GlowMessageProps) {
  const [isNew, setIsNew] = useState(animate);

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => {
        setIsNew(false);
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [animate]);

  return (
    <div
      className={cn(        'relative rounded-lg p-3 transition-all duration-300',
        isSender 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted',
        isNew && isSender && 'shadow-[0_0_15px_var(--primary-glow)]',
        isNew && !isSender && 'shadow-[0_0_15px_rgba(120,120,120,0.3)]',
        className
      )}
    >
      {isNew && (
        <span className="absolute -top-1 -right-1 text-primary animate-pulse">
          <Sparkles className="h-3 w-3" />
        </span>
      )}
      {children}
    </div>
  );
}
