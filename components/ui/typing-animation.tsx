'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypingAnimationProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function TypingAnimation({ 
  className,
  size = 'md'
}: TypingAnimationProps) {
  const dotSize = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  };
  
  const containerPadding = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2'
  };
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1",
      containerPadding[size],
      "rounded-full bg-muted",
      className
    )}>
      <motion.div
        className={cn("rounded-full bg-muted-foreground/70", dotSize[size])}
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 1,
          delay: 0,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={cn("rounded-full bg-muted-foreground/70", dotSize[size])}
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 1,
          delay: 0.2,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className={cn("rounded-full bg-muted-foreground/70", dotSize[size])}
        animate={{ y: [0, -5, 0] }}
        transition={{ 
          repeat: Infinity, 
          duration: 1,
          delay: 0.4,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}

interface TypingIndicatorProps {
  users: { id: string; name: string }[];
  className?: string;
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (!users.length) return null;
  
  let message: string;
  if (users.length === 1) {
    message = `${users[0].name} is typing`;
  } else if (users.length === 2) {
    message = `${users[0].name} and ${users[1].name} are typing`;
  } else {
    message = `${users.length} people are typing`;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={cn(
        "flex items-center gap-2 text-xs text-muted-foreground",
        className
      )}
    >
      <TypingAnimation size="sm" />
      <span>{message}</span>
    </motion.div>
  );
}
